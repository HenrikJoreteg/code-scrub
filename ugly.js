var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var someOtherVar = 'thing'
// comments?

new WebpackDevServer(webpack(config), {

  publicPath: config.output.publicPath,
  hot: true
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }

              // ok

              var something = `template string`


              // what about JSX
    <jsx>
      </jsx>

    <h1></h1>
<div>

    </div>

  console.log('Listening at localhost:3000');
});
