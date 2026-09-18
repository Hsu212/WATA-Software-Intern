export type User = {
  id: string
  email: string
  name: string | null
  createdAt: string
  updatedAt: string
}

export type AuthResponse = {
  user: User
  accessToken: string
}

export type Message = {
  id: number
  sender: 'me' | 'bot'
  text: string
  time: string
}

export type ChatSession = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: Message[]
}