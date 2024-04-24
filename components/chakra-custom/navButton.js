import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const navButton = defineStyle({
  background: 'black',
  color: 'White',
  fontFamily: 'serif',
  fontWeight: 'normal',

  //let's also provide dark mode alternatives
  _dark: {
    background: 'red.300',
    color: 'orange.800',
  }
})

export const buttonTheme = defineStyleConfig({
  variants: { navButton },
})
