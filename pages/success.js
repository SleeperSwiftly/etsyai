import Link from "next/link";

export default function Success() {
  return (
    <div style={{ background: "#0e0c0a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#f0ebe3", textAlign: "center", padding: "24px" }}>
      <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✦</div>
      <h1 style={{ fontSize: "2rem", marginBottom: "12px" }}>You're Pro!</h1>
      <p style={{ color: "#8a7f72", marginBottom: "32px" }}>
        Your subscription is active. Go generate unlimited descriptions.
      </p>
      <Link href="/" style={{ background: "#e8c07d", color: "#0e0c0a", padding: "14px 32px", borderRadius: "12px", fontWeight: "700", textDecoration: "none", fontSize: "1rem" }}>
        Start Generating →
      </Link>
    </div>
  );
}
