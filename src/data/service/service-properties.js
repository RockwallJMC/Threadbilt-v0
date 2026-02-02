export const serviceProperties = [
  'Harborview Commerce Center',
  'Maple Ridge Plaza',
  'Westgate Office Park',
  'Summit Business Court',
  'Riverside Market Hall',
  'Cedar Point Logistics Hub',
  'Union Square Retail',
  'Pinecrest Industrial',
  'Lakefront Business Tower',
  'Oakmont Trade Center',
  'Granite Bay Commons',
  'Brookfield Corporate Park',
  'Northline Commerce Block',
  'Ironworks Exchange',
  'Southport Distribution',
  'Millstone Business Plaza',
  'Evergreen Tech Park',
  'Crossroads Commerce',
  'Parkview Corporate Center',
  'Seaboard Trade Campus',
];

export const servicePropertyAddresses = [
  { street: '4820 Harborview Blvd', cityZip: 'Seattle, WA 98134' },
  { street: '1150 Maple Ridge Ave', cityZip: 'Denver, CO 80202' },
  { street: '780 Westgate Dr', cityZip: 'Phoenix, AZ 85004' },
  { street: '62 Summit Pkwy', cityZip: 'Charlotte, NC 28202' },
  { street: '301 Riverside Way', cityZip: 'Portland, OR 97205' },
  { street: '950 Cedar Point Rd', cityZip: 'Austin, TX 78701' },
  { street: '210 Union Square', cityZip: 'San Francisco, CA 94108' },
  { street: '445 Pinecrest Ln', cityZip: 'Salt Lake City, UT 84101' },
  { street: '88 Lakefront Blvd', cityZip: 'Chicago, IL 60606' },
  { street: '36 Oakmont St', cityZip: 'Raleigh, NC 27601' },
  { street: '700 Granite Bay Rd', cityZip: 'Sacramento, CA 95814' },
  { street: '155 Brookfield Rd', cityZip: 'Nashville, TN 37203' },
  { street: '420 Northline Ave', cityZip: 'Dallas, TX 75201' },
  { street: '19 Ironworks Ave', cityZip: 'Pittsburgh, PA 15222' },
  { street: '905 Southport Blvd', cityZip: 'Tampa, FL 33602' },
  { street: '230 Millstone Way', cityZip: 'Columbus, OH 43215' },
  { street: '510 Evergreen Pkwy', cityZip: 'San Jose, CA 95113' },
  { street: '130 Crossroads Blvd', cityZip: 'Atlanta, GA 30303' },
  { street: '77 Parkview Ct', cityZip: 'Minneapolis, MN 55402' },
  { street: '260 Seaboard Dr', cityZip: 'Boston, MA 02110' },
];

export const getServicePropertyIndex = (id) => Number(id?.split('-')?.[1]) || 0;

export const getServicePropertyById = (id) => {
  const index = getServicePropertyIndex(id);
  return {
    index,
    name: serviceProperties[index % serviceProperties.length],
    address: servicePropertyAddresses[index % servicePropertyAddresses.length],
  };
};
