// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#0F121D', // All backgrounds
      paper: '#0F121D',   // Paper backgrounds (like cards)
    },
    primary: {
      main: '#2f2f31',    // All primary colors
      contrastText: '#F6F6F6', // Text color for primary elements
    },
    secondary: {
      main: '#8af1d9',    // All secondary, outline & accent colors
      contrastText: '#2f2f31', // Text color for secondary elements
    },
    text: {
      primary: '#F6F6F6', // Primary text color
      secondary: '#BDBDBD', // Secondary text color (if needed)
      disabled: '#8080a8',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          // Button styles can also be customized here
          '&:hover': {
            backgroundColor: '#fb8b24', // Hover color for buttons
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8af1d9', // Outline color
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8af1d9', // Change outline color on hover
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#8af1d9', // Change outline color when focused
          }
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: '#BDBDBD', // Default label color
          '&.Mui-focused': {
            color: '#8af1d9', // Label color when focused
          },
        },
      },
    },
    MuiIconButton: {
        styleOverrides: {
          root: {
            color: '#BDBDBD', // Set icon color to white
          },
        },
      }
  },
});

export default theme;
