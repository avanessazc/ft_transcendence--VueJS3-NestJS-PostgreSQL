export type Errors = {
  code: string;
  message: string;
};

export const error_codes: Array<Errors> = [
  {
    code: '001',
    message: 'Nickname already exists',
  },
  {
    code: '002',
    message: 'Email already exists',
  },
  {
    code: '003',
    message: 'Old Password does not match',
  },
  {
    code: '004',
    message:
      'The real typemime of the uploaded file does not match the file extension and should be png or jpg.',
  },
  {
    code: '005',
    message: 'User unauthenticated.',
  },
  {
    code: '006',
    message: 'User does not exist.',
  },
];
