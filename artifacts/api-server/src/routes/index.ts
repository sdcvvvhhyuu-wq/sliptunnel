import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tunnelRouter from "./tunnel";
import statsRouter from "./stats";
import profilesRouter from "./profiles";
import algorithmsRouter from "./algorithms";
import downloadsRouter from "./downloads";
import scannerRouter from "./scanner";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tunnelRouter);
router.use(statsRouter);
router.use(profilesRouter);
router.use(algorithmsRouter);
router.use(downloadsRouter);
router.use(scannerRouter);

export default router;
