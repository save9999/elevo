import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Elevo - Plateforme educative IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5B21B6 0%, #7C3AED 40%, #8B5CF6 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "44px",
              fontWeight: "bold",
              color: "#7C3AED",
            }}
          >
            E
          </div>
          <span style={{ fontSize: "52px", fontWeight: "bold", color: "white" }}>
            Elevo
          </span>
        </div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.3,
          }}
        >
          {"L'IA qui comprend chaque enfant"}
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: "600px",
            marginTop: "20px",
            lineHeight: 1.5,
          }}
        >
          {"Detection des troubles d'apprentissage et parcours personnalise de 3 a 18 ans"}
        </div>
      </div>
    ),
    { ...size }
  );
}
