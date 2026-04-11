import Grid from '@mui/material/Grid'
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import FormLayoutsBasic from 'src/views/form-layouts/package/EditPackage';
import 'react-datepicker/dist/react-datepicker.css'

const FormLayouts = () => {

  return (
    <DatePickerWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <FormLayoutsBasic />
        </Grid>
      </Grid>
    </DatePickerWrapper>
  )
}

export default FormLayouts
