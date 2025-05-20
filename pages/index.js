import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  LinearProgress,
  Alert,
  Snackbar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import axios from 'axios';
import moment from 'moment';

export default function WeWorkBooker() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });


  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setResults(null);
  
      const startDate = moment(data.startDate, 'YYYY-MM-DD');
      const endDate = moment(data.endDate, 'YYYY-MM-DD');
      const bookingDays = [];
      const bookingResults = [];
  
      // Generate array of booking days
      for (let date = startDate; date.isSameOrBefore(endDate); date.add(1, 'days')) {
        if (data.bookingDays === 'weekdays' && [0, 6].includes(date.day())) {
          continue;
        }
        bookingDays.push(date.format('YYYY-MM-DD'));
      }
  
      // Process bookings through API route
      for (const day of bookingDays) {
        try {
          const payload = {
            ApplicationType: "WorkplaceOne",
            PlatformType: "WEB",
            SpaceType: 4,
            TriggerCalendarEvent: true,
            Notes: {
              locationAddress: "Jl. Jendral Sudirman Kav. 21, RT 010 / RW 001 Karet Setiabudi",
              locationCity: "Jakarta",
              locationState: "JK",
              locationCountry: "IDN",
              locationName: "SINARMAS LAND PLAZA SUDIRMAN"
            },
            MailData: {
              startTimeFormatted: moment(data.startTime, 'HH:mm').format('hh:mm A'),
              endTimeFormatted: moment(data.endTime, 'HH:mm').format('hh:mm A'),
              startDateTime: `${day} ${data.startTime}`,
              endDateTime: `${day} ${data.endTime}`,
              locationName: "SINARMAS LAND PLAZA SUDIRMAN",
              locationCity: "Jakarta",
              locationCountry: "IDN",
              locationState: "JK"
            },
            LocationType: 0,
            UTCOffset: "+07:00",
            CreditRatio: 0,
            LocationID: data.locationId,
            SpaceID: data.spaceId,
            WeWorkSpaceID: data.spaceId,
            StartTime: moment(`${day} ${data.startTime}`).subtract(7, 'hours').toISOString(),
            EndTime: moment(`${day} ${data.endTime}`).subtract(7, 'hours').toISOString()
          };
  
          const response = await axios.post('/api/book', {
            bearerToken: data.bearerToken,
            payload
          });
  
          bookingResults.push({
            date: day,
            success: true,
            message: 'Booking successful'
          });
        } catch (error) {
          bookingResults.push({
            date: day,
            success: false,
            message: error.response?.data?.message || error.message
          });
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      setResults(bookingResults);
      setSnackbar({ open: true, message: 'Booking process completed', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          WeWork Space Booker
        </Typography>
        
        <Typography variant="body1" paragraph>
          Automate your WeWork space bookings with this tool. Enter your details below to schedule bookings.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            margin="normal"
            label="Bearer Token"
            {...register('bearerToken', { required: 'Token is required' })}
            error={!!errors.bearerToken}
            helperText={errors.bearerToken?.message}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Location ID"
            defaultValue="67a0a8eb-b18c-4217-ac0a-71438297679e"
            {...register('locationId', { required: 'Location ID is required' })}
            error={!!errors.locationId}
            helperText={errors.locationId?.message}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Space ID"
            defaultValue="3dee52f6-3e25-11e9-9bc8-0af5174e198c"
            {...register('spaceId', { required: 'Space ID is required' })}
            error={!!errors.spaceId}
            helperText={errors.spaceId?.message}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('startDate', { required: 'Start date is required' })}
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
            />

            <TextField
              fullWidth
              margin="normal"
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              {...register('endDate', { required: 'End date is required' })}
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              margin="normal"
              label="Start Time"
              type="time"
              defaultValue="08:00"
              InputLabelProps={{ shrink: true }}
              {...register('startTime', { required: 'Start time is required' })}
              error={!!errors.startTime}
              helperText={errors.startTime?.message}
            />

            <TextField
              fullWidth
              margin="normal"
              label="End Time"
              type="time"
              defaultValue="17:00"
              InputLabelProps={{ shrink: true }}
              {...register('endTime', { required: 'End time is required' })}
              error={!!errors.endTime}
              helperText={errors.endTime?.message}
            />
          </Box>

          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Booking Days</FormLabel>
            <RadioGroup row defaultValue="weekdays" {...register('bookingDays')}>
              <FormControlLabel value="weekdays" control={<Radio />} label="Weekdays Only (Mon-Fri)" />
              <FormControlLabel value="all" control={<Radio />} label="All Days" />
            </RadioGroup>
          </FormControl>

          {loading && <LinearProgress sx={{ my: 2 }} />}

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Submit Bookings'}
          </Button>
        </Box>

        {results && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Booking Results
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {results.map((result, index) => (
                <Alert
                  key={index}
                  severity={result.success ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                >
                  {moment(result.date).format('ddd, MMM D')}: {result.message}
                </Alert>
              ))}
            </Box>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Completed: {results.filter(r => r.success).length} successful,{' '}
              {results.filter(r => !r.success).length} failed
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}