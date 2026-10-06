from pathlib import Path
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.routers import scenarios, data, optimization, dashboard

app = FastAPI(
    title="DAOS API — Digital Agro Optimization System",
    description="REST API цифровой системы оптимизации сельскохозяйственного производства DAOS (Pyomo + GLPK)",
    version="2.4.0",
)

# CORS configuration for local development and Docker
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure plots folder exists and mount it for static serving
plots_dir = Path("./plots")
plots_dir.mkdir(parents=True, exist_ok=True)
app.mount("/plots", StaticFiles(directory=str(plots_dir)), name="plots")

# Include Routers
app.include_router(dashboard.router, prefix="/api")
app.include_router(scenarios.router, prefix="/api")
app.include_router(data.router, prefix="/api")
app.include_router(optimization.router, prefix="/api")


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "DAOS Digital Agro Optimization System API", "version": "2.4.0"}


# Mount frontend static files if available
frontend_candidates = [
    Path(__file__).resolve().parent.parent.parent / "frontend" / "dist",
    Path("./frontend/dist"),
    Path("/app/frontend/dist"),
]
frontend_dist = next((p for p in frontend_candidates if p.exists() and (p / "index.html").exists()), None)

if frontend_dist:
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Do not intercept API or docs routes
        if full_path.startswith(("api/", "plots/", "docs", "redoc", "openapi.json")):
            raise HTTPException(status_code=404, detail="Not found")

        target = frontend_dist / full_path
        if full_path and target.is_file():
            return FileResponse(target)
        return FileResponse(frontend_dist / "index.html")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.api.main:app", host="0.0.0.0", port=port, reload=True)
