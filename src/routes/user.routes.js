import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", registerUser);

router.get("/register", async(req,res)=>{
  res.send("hello welcome to register page:");
});

router.post("/login", loginUser);

export default router;
