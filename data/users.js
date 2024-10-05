import bcrypt from 'bcryptjs'

const users = [
   {
      name: 'Admin User',
      email: 'admin@email.com',
      password: bcrypt.hashSync('123456', 10),
      shippingAddress: {
         address: '36, Tehran, Iran',
         city: 'Tehran',
         postalCode: '123456789',
         country: 'Iran',
      },
      isAdmin: true,
   },
   {
      name: 'Amir',
      email: 'amir@email.com',
      password: bcrypt.hashSync('123456', 10),
      shippingAddress: {
         address: '36, Tehran, Iran',
         city: 'Tehran',
         postalCode: '123456789',
         country: 'Iran',
      },
      isAdmin: false,
   },
   {
      name: 'Mohammad',
      email: 'mohammad@email.com',
      password: bcrypt.hashSync('123456', 10),
      shippingAddress: {
         address: '36, Tehran, Iran',
         city: 'Tehran',
         postalCode: '123456789',
         country: 'Iran',
      },
      isAdmin: false,
   },
]

export default users