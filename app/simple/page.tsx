"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function SimpleMVP() {
  const [step, setStep] = useState<"upload" | "customize" | "share">("upload");
  const [panoramaUrl, setPanoramaUrl] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [storeName, setStoreName] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPanoramaUrl(e.target?.result as string);
      setStep("customize");
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) return;

    const product: Product = {
      id: `product_${Date.now()}`,
      name: newProduct.name,
      price: parseFloat(newProduct.price),
    };

    setProducts([...products, product]);
    setNewProduct({ name: "", price: "" });
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : ""}/store?custom=${btoa(JSON.stringify({ name: storeName, panoramaUrl, products }))}`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-800">Walk In</Link>
          <div className="text-sm text-slate-500">Simple MVP</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step === "upload" ? "text-sky-600" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "upload" ? "bg-sky-500 text-white" : "bg-slate-200"}`}>1</div>
            <span className="font-medium">Upload</span>
          </div>
          <div className="w-12 h-px bg-slate-300" />
          <div className={`flex items-center gap-2 ${step === "customize" ? "text-sky-600" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "customize" ? "bg-sky-500 text-white" : "bg-slate-200"}`}>2</div>
            <span className="font-medium">Customize</span>
          </div>
          <div className="w-12 h-px bg-slate-300" />
          <div className={`flex items-center gap-2 ${step === "share" ? "text-sky-600" : "text-slate-400"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "share" ? "bg-sky-500 text-white" : "bg-slate-200"}`}>3</div>
            <span className="font-medium">Share</span>
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">Create your 3D store in 60 seconds</h1>
            <p className="text-lg text-slate-600 mb-8">Upload a 360° photo of your establishment to get started</p>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 bg-white/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="panorama-upload"
              />
              <label
                htmlFor="panorama-upload"
                className="cursor-pointer inline-flex items-center gap-2 bg-sky-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-sky-600 transition-colors"
              >
                <span>📷</span>
                Upload 360° Photo
              </label>
              <p className="mt-4 text-sm text-slate-500">JPG, PNG, or WebP. Equirectangular format recommended.</p>
            </div>

            <div className="mt-8 text-left bg-sky-50 rounded-xl p-6">
              <h3 className="font-semibold text-slate-800 mb-2">📱 How to capture a 360° photo:</h3>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Download Google Street View (free app)</li>
                <li>Stand in the center of your space</li>
                <li>Tap the camera icon and rotate slowly</li>
                <li>Export and upload here</li>
              </ol>
            </div>
          </div>
        )}

        {/* Step 2: Customize */}
        {step === "customize" && (
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Add your products</h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Preview */}
              <div>
                <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video">
                  {panoramaUrl && (
                    <img src={panoramaUrl} alt="Panorama" className="w-full h-full object-cover" />
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Store name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2"
                />
              </div>

              {/* Products */}
              <div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">Products ({products.length})</h3>

                  <div className="space-y-3 mb-4">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <p className="text-sm text-slate-600">${product.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Product name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button
                      onClick={addProduct}
                      className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setStep("share")}
                  disabled={products.length === 0 || !storeName}
                  className="mt-6 w-full bg-sky-500 text-white py-3 rounded-full font-semibold hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Share */}
        {step === "share" && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-4">Your 3D store is ready! 🎉</h1>
            <p className="text-lg text-slate-600 mb-8">Share this link with your customers</p>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <p className="text-sm text-slate-500 mb-2">Your store link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm bg-slate-50"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareLink)}
                  className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <a
                href={shareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sky-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-sky-600"
              >
                Preview Store
              </a>
              <button
                onClick={() => setStep("upload")}
                className="border border-slate-300 text-slate-700 px-8 py-3 rounded-full font-semibold hover:bg-slate-50"
              >
                Create Another
              </button>
            </div>

            <div className="mt-8 bg-emerald-50 rounded-xl p-6 text-left">
              <h3 className="font-semibold text-emerald-800 mb-2">✅ What&apos;s next?</h3>
              <ul className="space-y-1 text-emerald-700">
                <li>• Share the link on social media</li>
                <li>• Add it to your Google Business profile</li>
                <li>• Send it to customers via email/SMS</li>
                <li>• Track views and engagement (coming soon)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
