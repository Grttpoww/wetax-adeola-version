declare module 'react-native-confetti' {
  import React from 'react'
  import Confetti from 'react-native-confetti'

  export const Confetti: React.FC<{
    untilStopped: boolean
    ref: React.ReactNode
    size: number
  }> & {
    stopConfetti: () => {}
    startConfetti: () => {}
  } = Confetti

  export default Confetti
}
