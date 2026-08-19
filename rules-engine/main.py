from fastapi import FastAPI
from app.routes import router

app = FastAPI(title="JanSetu AI Rules Engine")

app.include_router(router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
