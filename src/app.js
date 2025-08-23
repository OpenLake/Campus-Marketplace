import express from "express"
import heathcheckRouter from "./routes/healthcheck.routes.js"

const app = express()

app.use("/",(req,res)=>{
    res.status(200).json({
        success:true,
        message:"Server is running"
    })
})
app.use("/api/v1/heathcheck",heathcheckRouter)

export default app