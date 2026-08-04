# Deployment Guide

This guide covers deploying Walk In to AWS ECS with Cloudflare DNS/CDN.

## Architecture

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
