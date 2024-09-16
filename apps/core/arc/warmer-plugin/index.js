module.exports = {
  deploy: {
    start: async ({ cloudformation }) => {
      cloudformation.Resources.AnyCatchallHTTPLambda.Properties.Runtime =
        'nodejs18.x';
      //         'arn:aws:lambda:us-east-1::runtime:0cdcfbdefbc5e7d3343f73c2e2dd3cba17d61dea0686b404502a0c9ce83931b9';

      return cloudformation;
    },
  },
};
