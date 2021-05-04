// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import formidable from 'formidable'

export default async (req, res) => {
  console.log('RECIEVED')
  await new Promise(function (resolve, reject) {
    const form = new formidable.IncomingForm({ keepExtensions: true });
    form.parse(req, function (err, fields, files) {
      if (err) return reject();
      resolve({ fields, files });
    });
  });
  res.status(200).json({ name: 'John Doe' })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
