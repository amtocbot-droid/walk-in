# Deployment Guide

This guide covers deploying Walk In as a Docker container (the SEOlith LLC standard) and to AWS ECS with Cloudflare DNS/CDN.

## Docker (SEOlith Standard)

The app ships as a multi-stage `Dockerfile` with three runnable targets:

| Target | Purpose | Compose service |
|--------|---------|-----------------|
| `runner` | Hardened distroless Next.js standalone server | `app` |
| `migrator` | One-shot `prisma migrate deploy` | `migrate` |
| `worker` | Photogrammetry background worker | `worker` |

The default `next.config.js` builds `output: "standalone"` for containers.
Cloudflare Pages uses `next.config.cloudflare.js` via `npm run build:cloudflare` instead.

### Local / single-host deployment

```bash
# .env must define at least AUTH_SECRET (openssl rand -base64 32)
docker compose up --build -d
```

Startup order: `postgres` (health-gated) → `migrate` (applies `prisma/migrations`) → `app` + `worker`.

### Production hardening profile

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

The prod profile runs the container read-only, drops all capabilities, sets
`no-new-privileges`, and expects external `DATABASE_URL` / `REDIS_URL`
(managed Postgres/Redis). Run migrations once per release:

```bash
docker compose -f docker-compose.prod.yml run --rm \
  -e DATABASE_URL=postgresql://user:pass@host:5432/walkin \
  --build migrate
```

### Health check

`GET /api/health` returns `{ "status": "ok", ... }` and is wired into both the
image `HEALTHCHECK` and the prod compose healthcheck.

## EC2 + docker compose (current production path)

Single-host deployment driven by CI/CD (`.github/workflows/deploy-ec2.yml`):
push to `main` → typecheck/lint/build → images pushed to ECR
(`walk-in` and `walk-in-migrator`) → SSH to the host → `docker compose pull && up -d`.

### One-time host provisioning

1. Launch an EC2 instance (Amazon Linux 2023, `t3.small` or larger) with
   `deploy/ec2-user-data.sh` as user-data. Security group: 22 (your IP / CI),
   80/443 (Cloudflare or public).
2. Attach an Elastic IP so the DNS target is stable.
3. Put runtime secrets in `/opt/walk-in/.env` on the host:
   `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `POSTGRES_PASSWORD`,
   plus `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY` as needed.
4. The host needs ECR pull access — either an instance role with
   `AmazonEC2ContainerRegistryReadOnly` or IAM credentials in the deploy step.

### GitHub secrets required

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | CI credentials with ECR push |
| `ECR_REGISTRY` | e.g. `123456789012.dkr.ecr.us-east-1.amazonaws.com` |
| `EC2_HOST` | Elastic IP or hostname |
| `EC2_SSH_KEY` | Private key for `ec2-user` |

### Manual deploy / rollback

```bash
ssh ec2-user@<EC2_HOST>
cd /opt/walk-in
export ECR_REGISTRY=<registry> IMAGE_TAG=<git-sha>   # pick a previous sha to roll back
docker compose -f docker-compose.ec2.yml pull
docker compose -f docker-compose.ec2.yml up -d
```

Every push is tagged with its git SHA in ECR, so rollback is redeploying an older tag.

## AWS ECS Architecture

- **Frontend + API**: AWS ECS Fargate (Docker container)
- **Database**: AWS RDS PostgreSQL
- **Cache/Queue**: AWS ElastiCache Redis
- **Storage**: AWS S3 + CloudFront
- **DNS/CDN/WAF**: Cloudflare

## Prerequisites

1. AWS account with permissions for ECS, RDS, ElastiCache, S3, CloudFront, VPC, and IAM.
2. Cloudflare account with a domain zone.
3. Docker Hub or ECR for the container image.

## Step 1: AWS Infrastructure

```bash
cd terraform
terraform init
terraform plan \
  -var="docker_image=your-docker-username/walk-in" \
  -var="db_password=your-secure-password" \
  -var="auth_secret=$(openssl rand -base64 32)" \
  -var="app_url=https://walk-in.yourdomain.com"
terraform apply
```

Outputs you need:
- `alb_dns_name` — for Cloudflare CNAME
- `rds_endpoint` — for `DATABASE_URL`
- `redis_endpoint` — for `REDIS_URL`
- `s3_bucket` — for `S3_BUCKET`
- `cloudfront_domain` — for asset CDN

## Step 2: GitHub Secrets

Set these in your repository settings:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | e.g., `us-east-1` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with DNS edit |
| `CLOUDFLARE_ZONE_ID` | Your domain's zone ID |
| `CLOUDFLARE_RECORD_ID` | DNS record ID for walk-in subdomain |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |
| `ALB_DNS_NAME` | ALB DNS name from Terraform output |
| `AUTH_SECRET` | Auth.js session secret |
| `NEXT_PUBLIC_APP_URL` | e.g., `https://walk-in.yourdomain.com` |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `S3_BUCKET` | S3 bucket name |
| `AWS_REGION` | AWS region |

## Step 3: Cloudflare DNS

1. Create a CNAME record: `walk-in` → `<alb_dns_name>`
2. Enable Cloudflare proxy (orange cloud) for CDN/WAF.
3. Set SSL/TLS mode to "Full (strict)".
4. Create a Page Rule to cache static assets: `*walk-in.yourdomain.com/_next/static/*` → Cache Level: Cache Everything.

## Step 4: Deploy

Push to `main` or trigger the workflow manually:

```bash
gh workflow run deploy-aws.yml
```

The workflow will:
1. Run typecheck, lint, and build.
2. Build and push the Docker image to ECR.
3. Update the ECS service.
4. Invalidate CloudFront cache.
5. Update Cloudflare DNS.

## Step 5: Database Migration

After the first deployment, run migrations:

```bash
aws ecs run-task \
  --cluster walk-in-production \
  --task-definition walk-in-production \
  --overrides '{"containerOverrides":[{"name":"app","command":["npx","prisma","migrate","deploy"]}]}'
```

Or run locally against RDS:

```bash
DATABASE_URL="postgresql://walkin:password@<rds_endpoint>/walkin" npx prisma migrate deploy
```

## Step 6: Verify

- Visit `https://walk-in.yourdomain.com` — should show the landing page.
- Visit `https://walk-in.yourdomain.com/api/v1/stores` — should return `{"stores":[]}`.
- Sign up at `/signup`, create a store, and visit `/s/[storeId]`.

## Cloudflare Pages Alternative

If you prefer Cloudflare Pages for the frontend:

1. Keep API routes on AWS ECS.
2. Set `NEXT_PUBLIC_API_URL` to your ECS ALB.
3. Deploy the frontend to Cloudflare Pages with `wrangler.toml`.

Note: The current app uses Node.js APIs (Prisma, Redis, S3) that don't run on Cloudflare Workers. A full Cloudflare deployment would require migrating to D1, KV, and R2.
