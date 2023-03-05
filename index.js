const express = require("express")
const app = express()
const cors = require("cors")
const jwt = require("jsonwebtoken")

const privateKey = "secret"
const refreshKey = "refresh"

app.use(express.json())
app.use(cors())

const userInfo = [
  {
    id: "1234",
    password: "1234",
  },
  {
    id: "qwer",
    password: "1234",
  },
]

// 로그인
app.post("/login", (req, res) => {
  // body id, password
  const { id, password } = req.body
  const userIndex = userInfo.findIndex((item) => item.id === id)
  if (userIndex > -1) {
    // ID는 있음
    if (userInfo[userIndex].password === password) {
      // password 맞음
      res.status(200).json({
        msg: "로그인 성공",
        accessToken: jwt.sign({ userId: id }, privateKey, { expiresIn: "10m" }),
        refreshToken: jwt.sign({ userId: id }, refreshKey, { expiresIn: "20m" }),
      })
      return
    }
  }

  res.status(500).send("로그인 실패")
})

// 회원가입
app.post("/signIn", (req, res) => {
  console.log(req.body)
  // body id, password
  const { id, password } = req.body

  if (userInfo.findIndex((item) => item.id === id) > -1) {
    res.status(500).send("회원가입 실패")
    return
  }

  userInfo.push({
    id,
    password,
  })
  console.log("userInfo", userInfo)

  res.send("회원가입 성공")
})

// 유저 리스트
app.get("/userInfo", (req, res) => {
  const accessToken = req.header("access-token")

  jwt.verify(accessToken, privateKey, (err, decoded) => {
    if (err) {
      // if (err.name === "TokenExpiredError") return res.status(401).send("토큰 유효기간 만료")
      // res.status(500).send("에러")
      // return

      return res.status(401).send("토큰 오류")
    }
    res.status(200).json({
      userInfo,
    })
  })
})

// 특정 유저 정보
app.get("/userInfo/:id", (req, res) => {
  const accessToken = req.header("access-token")
  const { id } = req.params

  jwt.verify(accessToken, privateKey, (err, decoded) => {
    if (err) {
      return res.status(401).send("토큰 오류")
    }
    res.status(200).json({
      user: userInfo.find((item) => item.id === id),
    })
  })
})

// 리프레시 토큰
app.get("/refreshToken", (req, res) => {
  const refreshToken = req.header("refresh-token")

  jwt.verify(refreshToken, refreshKey, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") return res.status(401).send("토큰 유효기간 만료")
      res.status(500).send("에러")
      return
    }
    console.log("decode: ", decoded)

    res.status(200).json({
      accessToken: jwt.sign({ userId: decoded.id }, privateKey, { expiresIn: "10m" }),
    })
  })
})

const port = 3000
app.listen(port, () => console.log(`${port}서버 실행 성공 `))
