<div align="center">

# ⚖️ METRONOX
### Autonomous 6-Axis AI Packaging Metrology & Statutory Digital Twin Engine

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/ZeroGPU-HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face" />
  <img src="https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

<p align="center">
  <b>Automated Packaging Verification Engine for Legal Metrology Act 2009, FSSAI 2020 & Drugs and Cosmetics Rules 1945</b>
</p>

<p align="center">
  <a href="#-key-capabilities">Key Features</a> •
  <a href="#-statutory-enforcement-matrix">Compliance Matrix</a> •
  <a href="#-technical-architecture--pipeline">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-layout">Project Layout</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-rest-api-documentation">API Reference</a>
</p>

---

</div>

## 📌 Executive Summary

**Metronox** is an enterprise AI-driven statutory packaging metrology system engineered to automate inspections of pre-packaged retail commodities across Food, FMCG, Cosmetics, and Pharmaceutical domains.

By integrating **6-axis contour-stabilized optical tracking**, **luminance-equalized CLAHE filtering**, **multi-pass rotational OCR (0°, 90°, 180°, 270°)**, and **photogrammetric 3D digital twin reconstruction**, Metronox detects compliance infractions (mandatory declaration deficits, font height deficits, non-compliant MRP/USP formats) in under **1.8 seconds per SKU** and automatically issues court-admissible **Form V Violation Citations**.

---

## ⚡ Key Capabilities

```text
┌────────────────────────────────────────────────────────┐
│                  METRONOX AI ENGINE                    │
└──────────────────────────┬─────────────────────────────┘
                           │
  ┌─────────────────────────┼────────────┬────────────────────────┐
  ▼                         ▼            ▼                        ▼
┌───────────┐         ┌───────────┐ ┌───────────┐          ┌───────────┐
│  6-Axis   │         │ Adaptive  │ │  Rule 7   │          │ 3D Mesh   │
│  Optical  │         │ Multi-Pass│ │  PDP Font │          │ Digital   │
│  Tracking │         │    OCR    │ │  Auditor  │          │   Twin    │
└─────┬─────┘         └─────┬─────┘ └─────┬─────┘          └─────┬─────┘
      │                     │            │                       │
      ▼                     ▼            ▼                       ▼
• 1:1 Square HUD      • 0/90/180/270°    • Table 1 Minimums    • White Substrate
• Auto Reticle Center • RapidOCR ONNX    • 1.0mm-6.0mm Verif.  • Binary .GLB
• Stabilization       • GS1 Country Code • Geometric Sizing    • WebGL Orbit