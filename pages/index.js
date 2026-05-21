import { useState, useEffect } from "react";
import Head from "next/head";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const isPro = user?.publicMetadata?.isPro === true;

  const [form, setForm] = useState({
    productName: "",
    materials: "",
    style: "",
    keywords: "",
    targetBuyer: "",
  });
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const FREE_LIMIT = 5;

  useEffect(() => {
    if (user) {
      const key = `usageCount_${user.id}`;
      const saved = parseInt(localStorage.getItem(key) || "0");
      setUsageCount(saved);
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpgrade = async () => {
    try {
      const res = await fetch("/api/create-checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!isSignedIn) {
      setError("Please sign in to generate descriptions.");
      return;
    }
    if (!form.productName.trim()) {
      setError("Please enter a product name.");
      return;
    }
    if (!isPro && usageCount >= FREE_LIMIT) {
      setError("You've used all 5 free generations. Upgrade to continue.");
      return;
    }
    setLoading(true);
    setError("");
    setDescriptions([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDescriptions(data.descriptions);
      if (!isPro) {
        const next = usageCount + 1;
        setUsageCount(next);
        localStorage.setItem(`usageCount_${user.id}`, next);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <Head>
        <title>Listify Shop — Etsy Descriptions That Sell</title>
        <meta name="description" content="Generate SEO-optimized Etsy product descriptions in seconds using AI." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        <header className="header">
          <div className="logo">✦ Listify Shop</div>
          <div className="header-right">
            <SignedOut>
              <SignInButton mode="modal"><button className="auth-btn">Sign In</button></SignInButton>
              <SignUpButton mode="modal"><button className="auth-btn primary">Sign Up</button></SignUpButton>
            </SignedOut>
            <SignedIn>
              {isPro ? (
                <div className="pro-badge">✦ Pro</div>
              ) : (
                <div className="usage-badge">
                  {Math.max(0, FREE_LIMIT - usageCount)} free {FREE_LIMIT - usageCount === 1 ? "generation" : "generations"} left
                </div>
              )}
              <UserButton />
            </SignedIn>
          </div>
        </header>

        <section className="hero">
          <div className="hero-tag">AI-Powered Etsy Copywriting</div>
          <h1 className="hero-title">
            Descriptions that<br />
            <span className="accent">actually sell.</span>
          </h1>
          <p className="hero-sub">
            Stop staring at a blank screen. Get 3 SEO-optimized Etsy product descriptions in under 10 seconds.
          </p>
        </section>

        <section className="form-section">
          <div className="form-card">
            <div className="form-grid">
              <div className="field full">
                <label>Product Name <span className="req">*</span></label>
                <input name="productName" placeholder="e.g. Hand-poured lavender soy candle" value={form.productName} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Materials</label>
                <input name="materials" placeholder="e.g. soy wax, cotton wick, essential oils" value={form.materials} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Style / Aesthetic</label>
                <input name="style" placeholder="e.g. minimalist, boho, cottagecore" value={form.style} onChange={handleChange} />
              </div>
              <div className="field">
                <label>SEO Keywords</label>
                <input name="keywords" placeholder="e.g. gift for her, home decor, relaxation" value={form.keywords} onChange={handleChange} />
              </div>
              <div className="field">
                <label>Target Buyer</label>
                <input name="targetBuyer" placeholder="e.g. new moms, college students, dog lovers" value={form.targetBuyer} onChange={handleChange} />
              </div>
            </div>

            {error && <p className="error">{error}</p>}

            <SignedIn>
              <button className="generate-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <span className="loading-inner"><span className="spinner" /> Generating...</span>
                ) : (
                  "✦ Generate Descriptions"
                )}
              </button>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="generate-btn">✦ Sign Up to Generate</button>
              </SignUpButton>
            </SignedOut>
          </div>
        </section>

        {descriptions.length > 0 && (
          <section className="results">
            <h2 className="results-title">Your 3 Descriptions</h2>
            <div className="cards">
              {descriptions.map((desc, i) => (
                <div className="desc-card" key={i}>
                  <div className="desc-header">
                    <span className="desc-label">Option {i + 1}</span>
                    <button className={`copy-btn ${copied === i ? "copied" : ""}`} onClick={() => handleCopy(desc, i)}>
                      {copied === i ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="desc-text">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isPro && usageCount >= FREE_LIMIT && (
          <section className="upgrade">
            <div className="upgrade-card">
              <h3>You've used all your free generations</h3>
              <p>Upgrade to unlimited for $12/month — less than a coffee a week.</p>
              <button className="upgrade-btn" onClick={handleUpgrade}>Upgrade Now — $12/mo</button>
            </div>
          </section>
        )}

        <footer className="footer">
          <p>© 2025 Listify Shop · Built for Etsy sellers who'd rather be making things.</p>
        </footer>
      </div>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0e0c0a; color: #f0ebe3; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
      `}</style>

      <style jsx>{`
        .page { max-width: 860px; margin: 0 auto; padding: 0 24px 80px; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 28px 0 0; }
        .logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #e8c07d; letter-spacing: 0.02em; }
        .header-right { display: flex; align-items: center; gap: 12px; }
        .auth-btn { background: transparent; border: 1px solid #3a3020; color: #b8a07a; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .auth-btn:hover { border-color: #e8c07d; color: #e8c07d; }
        .auth-btn.primary { background: #e8c07d; color: #0e0c0a; border-color: #e8c07d; }
        .auth-btn.primary:hover { background: #f0cc8a; }
        .usage-badge { background: #1e1a14; border: 1px solid #3a3020; color: #b8a07a; font-size: 0.8rem; font-weight: 500; padding: 6px 14px; border-radius: 100px; }
        .pro-badge { background: linear-gradient(135deg, #e8c07d, #f0cc8a); color: #0e0c0a; font-size: 0.8rem; font-weight: 700; padding: 6px 14px; border-radius: 100px; letter-spacing: 0.05em; }
        .hero { padding: 72px 0 48px; text-align: center; }
        .hero-tag { display: inline-block; background: #1e1a14; border: 1px solid #e8c07d44; color: #e8c07d; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 16px; border-radius: 100px; margin-bottom: 28px; }
        .hero-title { font-family: 'Playfair Display', serif; font-size: clamp(2.4rem, 6vw, 4rem); font-weight: 900; line-height: 1.1; color: #f0ebe3; margin-bottom: 20px; }
        .accent { color: #e8c07d; }
        .hero-sub { font-size: 1.1rem; color: #8a7f72; max-width: 520px; margin: 0 auto; line-height: 1.6; }
        .form-section { margin-bottom: 48px; }
        .form-card { background: #161210; border: 1px solid #2a2419; border-radius: 20px; padding: 40px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
        .field { display: flex; flex-direction: column; gap: 8px; }
        .field.full { grid-column: 1 / -1; }
        label { font-size: 0.82rem; font-weight: 600; color: #8a7f72; letter-spacing: 0.05em; text-transform: uppercase; }
        .req { color: #e8c07d; }
        input { background: #0e0c0a; border: 1px solid #2a2419; border-radius: 10px; padding: 13px 16px; color: #f0ebe3; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; transition: border-color 0.2s; outline: none; }
        input:focus { border-color: #e8c07d66; }
        input::placeholder { color: #3a3428; }
        .error { color: #e07d7d; font-size: 0.88rem; margin-bottom: 16px; padding: 10px 14px; background: #2a1414; border-radius: 8px; border: 1px solid #4a2020; }
        .generate-btn { width: 100%; background: #e8c07d; color: #0e0c0a; border: none; border-radius: 12px; padding: 16px; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.1s; letter-spacing: 0.02em; }
        .generate-btn:hover:not(:disabled) { background: #f0cc8a; transform: translateY(-1px); }
        .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .loading-inner { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .spinner { width: 16px; height: 16px; border: 2px solid #0e0c0a44; border-top-color: #0e0c0a; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .results { margin-top: 8px; }
        .results-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; margin-bottom: 24px; color: #f0ebe3; }
        .cards { display: flex; flex-direction: column; gap: 20px; }
        .desc-card { background: #161210; border: 1px solid #2a2419; border-radius: 16px; padding: 28px; animation: fadeUp 0.4s ease forwards; opacity: 0; }
        .desc-card:nth-child(1) { animation-delay: 0.05s; }
        .desc-card:nth-child(2) { animation-delay: 0.15s; }
        .desc-card:nth-child(3) { animation-delay: 0.25s; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .desc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .desc-label { font-size: 0.78rem; font-weight: 600; color: #e8c07d; text-transform: uppercase; letter-spacing: 0.1em; }
        .copy-btn { background: #2a2419; border: 1px solid #3a3020; color: #8a7f72; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600; padding: 6px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .copy-btn:hover { border-color: #e8c07d44; color: #e8c07d; }
        .copy-btn.copied { background: #1a2a1a; border-color: #4a8a4a44; color: #7ab87a; }
        .desc-text { font-size: 0.95rem; line-height: 1.75; color: #c0b9ae; white-space: pre-wrap; }
        .upgrade { margin-top: 40px; }
        .upgrade-card { background: linear-gradient(135deg, #1e1a0e, #2a2010); border: 1px solid #e8c07d33; border-radius: 20px; padding: 40px; text-align: center; }
        .upgrade-card h3 { font-family: 'Playfair Display', serif; font-size: 1.5rem; margin-bottom: 10px; }
        .upgrade-card p { color: #8a7f72; margin-bottom: 24px; }
        .upgrade-btn { background: #e8c07d; color: #0e0c0a; border: none; border-radius: 12px; padding: 14px 32px; font-family: 'DM Sans', sans-serif; font-size: 1rem; font-weight: 700; cursor: pointer; }
        .upgrade-btn:hover { background: #f0cc8a; }
        .footer { text-align: center; margin-top: 80px; color: #3a3428; font-size: 0.82rem; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .form-card { padding: 24px; } .hero { padding: 48px 0 32px; } }
      `}</style>
    </>
  );
}
