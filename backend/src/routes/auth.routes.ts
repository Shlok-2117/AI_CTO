import { Router } from 'express'
import { register, login, logout, refreshTokenHandler } from '../controllers/auth.controller'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh', refreshTokenHandler)

export default router
