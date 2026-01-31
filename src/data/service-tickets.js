import { List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { initialConfig } from 'config';

const image = (name) => `${initialConfig.assetsDir}/images/events/${name}.webp`;

export const eventInfo = {
  title: 'Annual Security System Inspection - Commercial Office Building',
  date: 'Saturday, 29 May, 2024',
  startTime: '9:00am',
  endTime: '11:00am',
  organizerName: 'Acme Security Solutions',
  location: 'Maverick Convention Center, 56335 Ardella Greens Apt. 511, East Maeville, Arizona',
  mapLink: '#!',
};

export const description = {
  content: (
    <>
      <Typography variant="body1" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary' }}>
        🔧 Service Ticket Summary
      </Typography>
      <Typography variant="body1">
        Scheduled annual inspection and maintenance of security system at commercial office building.
        This comprehensive service includes testing all entry points, verifying camera functionality,
        and updating system firmware.
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 700, my: 3 }}>
        Work to be Performed:
      </Typography>
      <List dense disablePadding sx={{ mt: 3 }}>
        <ListItem disablePadding disableGutters sx={{ mb: 2 }}>
          <ListItemText
            disableTypography
            sx={{ m: 0 }}
            primary={
              <Stack sx={{ columnGap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  1.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                  }}
                >
                  <Typography
                    component="span"
                    variant={'subtitle1'}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      display: 'inline-block',
                      mr: 0.5,
                    }}
                  >
                    System Testing:
                  </Typography>
                  Test all door sensors, motion detectors, and glass break sensors to ensure proper
                  functionality and response times.
                </Typography>
              </Stack>
            }
          />
        </ListItem>
        <ListItem disablePadding disableGutters sx={{ mb: 2 }}>
          <ListItemText
            disableTypography
            sx={{ m: 0 }}
            primary={
              <Stack sx={{ columnGap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  2.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                  }}
                >
                  <Typography
                    component="span"
                    variant={'subtitle1'}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      display: 'inline-block',
                      mr: 0.5,
                    }}
                  >
                    Camera Verification:
                  </Typography>{' '}
                  Inspect all 12 surveillance cameras for proper positioning, image quality, and
                  night vision capabilities.
                </Typography>
              </Stack>
            }
          />
        </ListItem>
        <ListItem disablePadding disableGutters sx={{ mb: 2 }}>
          <ListItemText
            disableTypography
            sx={{ m: 0 }}
            primary={
              <Stack sx={{ columnGap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  3.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                  }}
                >
                  <Typography
                    component="span"
                    variant={'subtitle1'}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      display: 'inline-block',
                      mr: 0.5,
                    }}
                  >
                    Firmware Updates:
                  </Typography>{' '}
                  Apply latest security patches and firmware updates to control panel and all
                  connected devices.
                </Typography>
              </Stack>
            }
          />
        </ListItem>
        <ListItem disablePadding disableGutters>
          <ListItemText
            disableTypography
            sx={{ m: 0 }}
            primary={
              <Stack sx={{ columnGap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  4.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                  }}
                >
                  <Typography
                    component="span"
                    variant={'subtitle1'}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      display: 'inline-block',
                      mr: 0.5,
                    }}
                  >
                    Documentation:
                  </Typography>{' '}
                  Provide detailed service report with before/after photos, test results, and
                  recommendations for any needed repairs.
                </Typography>
              </Stack>
            }
          />
        </ListItem>
      </List>

      <Typography variant="body1" sx={{ fontWeight: 700, my: 3 }}>
        Service Agreement:
      </Typography>
      <Typography variant="body1">
        This service is part of the annual maintenance contract. All work will be performed by
        certified technicians using OEM-approved parts and procedures. Service includes 90-day
        warranty on all work performed.
      </Typography>
    </>
  ),
  image: image('details/2'),
};

export const schedule = {
  info: [
    {
      label: 'Scheduled Arrival',
      time: '9:00am',
    },
    {
      label: 'Service Window Start',
      time: '09:00am',
    },
    {
      label: 'Service Window End',
      time: '11:00am',
    },
  ],
  image: { src: image('details/3'), alt: 'Service location' },
};

export const performerList = {
  performers: [
    'Test all entry sensors',
    'Verify camera functionality',
    'Check motion detectors',
    'Update firmware',
    'Clean camera lenses',
    'Test backup battery',
    'Verify cellular backup',
    'Provide service report',
  ],
  image: { src: image('details/4'), alt: 'Security equipment' },
};

export const organizerEvents = [
  {
    id: 1,
    title: 'HVAC Maintenance - Office Building',
    image: image('1'),
    priceRange: '$125 - $225',
    description: 'Quarterly HVAC system inspection and filter replacement for commercial building.',
    date: 'Monday, 2 Dec, 2024',
    time: '8:00am - 10:00am',
    location: 'Arizona, USA',
  },
  {
    id: 2,
    title: 'Emergency Fire Alarm Repair',
    image: image('2'),
    priceRange: '$150 - $350',
    description: 'Emergency service call to repair malfunctioning fire alarm system.',
    date: 'Thursday, 16 Dec, 2024',
    time: '2:00pm - 4:00pm',
    location: 'New York, USA',
  },
  {
    id: 3,
    title: 'Network Infrastructure Upgrade',
    image: image('3'),
    priceRange: '$500 - $800',
    description: 'Install new network switches and upgrade cabling for improved connectivity.',
    date: 'Monday, 20 Dec, 2024',
    time: '9:00am - 5:00pm',
    location: 'Dothan, USA',
  },
  {
    id: 4,
    title: 'Access Control System Installation',
    image: image('details/3'),
    priceRange: '$300 - $600',
    description: 'Install new keycard access control system for main entrance and parking garage.',
    date: 'Sunday, 13 October, 2024',
    time: '7:00am - 12:00pm',
    location: 'LA, USA',
  },
];

export const organizerInfo = {
  name: 'Acme Security Solutions',
  followers: 1250,
  phone: '+1-555-123-4567',
  email: 'service@acmesecurity.com',
  description:
    'Acme Security Solutions is your trusted partner for commercial security systems, HVAC maintenance, and facility management. We specialize in service contracts, emergency repairs, and system installations with 24/7 support. Our certified technicians ensure your business stays secure and operational. 🔧🛡️',
};

export const eventTermsConditions = {
  terms: [
    {
      id: 1,
      description: 'Service technician will arrive during the scheduled service window.',
    },
    {
      id: 2,
      description: 'Customer must provide site access and any necessary access codes.',
    },
    {
      id: 3,
      description: 'Payment is due upon completion of service unless invoicing is pre-approved.',
    },
    {
      id: 4,
      description:
        'Customer signature is required to authorize work and confirm completion of service.',
    },
    {
      id: 5,
      description:
        'All parts and labor are covered by a 90-day warranty from the date of service.',
    },
    {
      id: 6,
      description:
        'Additional charges may apply if work scope changes or additional parts are needed.',
    },
    {
      id: 7,
      description:
        'Service calls canceled with less than 24 hours notice may incur a cancellation fee.',
    },
    {
      id: 8,
      description:
        'Technician reserves the right to reschedule if site conditions are unsafe or access is unavailable.',
    },
    {
      id: 9,
      description:
        'Customer is responsible for securing pets and notifying technician of any site hazards.',
    },
    {
      id: 10,
      description:
        'Company is not liable for damage to property caused by pre-existing conditions.',
    },
    {
      id: 11,
      description:
        'All equipment remains property of the customer unless otherwise specified in service agreement.',
    },
    {
      id: 12,
      description:
        'Service documentation including photos and reports will be provided within 24 hours.',
    },
    {
      id: 13,
      description:
        'Emergency services are available 24/7 at premium rates as specified in service contract.',
    },
    {
      id: 14,
      description:
        'Customer data and site information is kept confidential per our privacy policy.',
    },
    {
      id: 15,
      description:
        'Disputes must be reported within 7 days of service completion for resolution.',
    },
  ],
  images: [
    { id: 1, src: image('details/5'), alt: 'Service equipment' },
    { id: 2, src: image('details/6'), alt: 'Completed installation' },
  ],
};
