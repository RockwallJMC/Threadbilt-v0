'use client';

import { useEffect, useRef } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import useNumberFormat from 'hooks/useNumberFormat';
import { useSnackbar } from 'notistack';
import SignatureCanvas from 'react-signature-canvas';
import IconifyIcon from 'components/base/IconifyIcon';
import SimpleBar from 'components/base/SimpleBar';
import EventTicketForm, {
  EventTicketFormSchema,
} from 'components/sections/events/event-detail/EventTicketForm';
import EventPaymentMethod, {
  EventPaymentMethodSchema,
} from 'components/sections/events/event-detail/main/EventPaymentMethod';

const ticketOptions = [
  {
    id: 'VIP',
    price: 300,
    icon: 'material-symbols:star-outline',
    amenities: ['Frontal zone', 'Seating arrangements', 'Water stall'],
  },
  {
    id: 'Regular',
    price: 150,
    icon: 'material-symbols:person-outline',
    amenities: ['Standing arrangements', 'Water stall'],
  },
];

const CombinedEventFormSchema = EventTicketFormSchema.concat(EventPaymentMethodSchema);

const TicketPurchaseDrawer = ({ open, handleClose, isNested = false }) => {
  const { currencyFormat } = useNumberFormat();
  const { enqueueSnackbar } = useSnackbar();
  const signatureRef = useRef(null);

  const methods = useForm({
    resolver: yupResolver(CombinedEventFormSchema),
    defaultValues: {
      method: 'card',
      cardDetails: {
        cardNumber: '',
        name: '',
        expiryDate: '',
        cvc: '',
      },
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitSuccessful },
  } = methods;

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  const onSubmit = (data) => {
    // Get signature data
    const signatureData = signatureRef.current?.toDataURL();

    if (!signatureData || signatureRef.current?.isEmpty()) {
      enqueueSnackbar('Please provide your signature', {
        variant: 'warning',
        autoHideDuration: 3000,
      });
      return;
    }

    console.log('Payment Form Data:', { ...data, signature: signatureData });
    enqueueSnackbar('Payment authorized successfully!', {
      variant: 'success',
      autoHideDuration: 3000,
    });
    handleClose();
  };

  useEffect(() => {
    reset();
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={(theme) => ({
        [`& .${drawerClasses.paper}`]: {
          maxWidth: 523,
          width: 1,
          bgcolor: 'background.elevation1',
        },
        zIndex: theme.zIndex.drawer + (isNested ? 2 : 1),
      })}
    >
      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SimpleBar sx={{ minHeight: 0, flex: 1, height: 1 }}>
            <Box
              sx={{
                pt: 5,
                px: { xs: 3, sm: 5 },
              }}
            >
              <Stack sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Authorize Payment</Typography>
                <IconButton onClick={handleClose}>
                  <IconifyIcon icon="material-symbols:close" fontSize={20} />
                </IconButton>
              </Stack>

              <Controller
                rules={{ required: true }}
                defaultValue="Regular"
                name="ticketType"
                control={control}
                render={({ field }) => (
                  <RadioGroup {...field} value={field.value || ''}>
                    <List
                      disablePadding
                      dense
                      sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}
                    >
                      {ticketOptions.map(({ id, icon, price, amenities }) => (
                        <ListItem
                          key={id}
                          sx={{
                            cursor: 'pointer',
                            p: 2,
                            pt: 1,
                            bgcolor:
                              field.value === id ? 'primary.lighter' : 'background.elevation2',
                            borderRadius: 6,
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: 1,
                          }}
                          onClick={() => field.onChange(id)}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <IconifyIcon icon={icon} color="primary.dark" sx={{ fontSize: 24 }} />
                            <ListItemText
                              primary={id}
                              secondary={`( ${currencyFormat(price, { maximumFractionDigits: 0 })} )`}
                              slotProps={{
                                primary: {
                                  fontWeight: 700,
                                  fontSize: '16px !important',
                                  lineHeight: 1.3,
                                },
                                secondary: {
                                  fontSize: 16,
                                  fontWeight: 700,
                                  color: 'text.secondary',
                                  lineHeight: 1.3,
                                },
                              }}
                              sx={{ display: 'flex', gap: 0.5, m: 0 }}
                            />

                            <Radio checked={field.value === id} />
                          </Stack>
                          <List
                            dense
                            component="div"
                            disablePadding
                            sx={{ display: 'flex', flexDirection: 'column', rowGap: 1 }}
                          >
                            {amenities.map((amenity) => (
                              <ListItem
                                component="div"
                                disablePadding
                                key={amenity}
                                sx={{
                                  pl: 4,
                                  gap: 1,
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 0 }}>
                                  <IconifyIcon
                                    icon="material-symbols:circle"
                                    color="background.elevation3"
                                    fontSize={8}
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={amenity}
                                  slotProps={{
                                    primary: {
                                      variant: 'subtitle2',
                                      fontWeight: 400,
                                      color: 'text.secondary',
                                    },
                                  }}
                                  sx={{ m: 0 }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </ListItem>
                      ))}
                    </List>
                  </RadioGroup>
                )}
              />
              <EventTicketForm sx={{ mb: 3 }} />

              {/* Signature Capture */}
              <Box sx={{ mb: 3 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Customer Signature
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleClearSignature}
                    startIcon={<IconifyIcon icon="material-symbols:refresh" />}
                  >
                    Clear
                  </Button>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Customer authorizes payment
                </Typography>
                <Box
                  sx={{
                    height: 150,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    overflow: 'hidden',
                    '& canvas': {
                      width: '100% !important',
                      height: '100% !important',
                    },
                  }}
                >
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      style: {
                        width: '100%',
                        height: '150px',
                      },
                    }}
                    backgroundColor="rgb(255, 255, 255)"
                  />
                </Box>
              </Box>

              <EventPaymentMethod />
            </Box>
          </SimpleBar>

          <Box
            sx={{
              px: { xs: 3, sm: 5 },
              pb: 5,
              pt: 3,
              position: 'sticky',
              bottom: 0,
              bgcolor: 'background.elevation1',
            }}
          >
            <Button type="submit" fullWidth variant="contained" color="primary">
              Authorize Payment & Close Ticket
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </Drawer>
  );
};

export default TicketPurchaseDrawer;
