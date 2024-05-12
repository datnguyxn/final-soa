import express from 'express'
const router = express.Router()

import { getReport,reportDetail, getOrderOfWeek, getAmountOfWeek, getOrderOfDay,getRevenueLastSixMonths, getSoldProductsStatistics } from '../controller/report.controller.js'

router.get('/', getReport)
router.post('/reportDetail', reportDetail)
router.get("/getOrderOfWeek", getOrderOfWeek)
router.get("/getAmountOfWeek", getAmountOfWeek)
router.get("/getOrderOfDay", getOrderOfDay)
router.get("/getRevenueLastSixMonths", getRevenueLastSixMonths)
router.get("/getSoldProductsStatistics", getSoldProductsStatistics)

export default router
