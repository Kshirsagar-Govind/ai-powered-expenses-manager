import { Router } from "express";
import { DeleteUser, LoginUser, RegisterNewUser, UpdateUserData } from "../controllers/user.controller";

const router = Router();
router.post("/", RegisterNewUser);
router.post("/login", LoginUser);
router.patch("/", UpdateUserData);
router.delete("/", DeleteUser);
export default router;
