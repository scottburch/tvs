import {resolve} from 'node:path'
import {map, of, switchMap} from "rxjs";
import WebpackDevServer from 'webpack-dev-server'
import Webpack from 'webpack'


export const startWebapp = (port: number) =>
    of({
        target: 'web',
        mode: 'development',
        devtool: 'eval-cheap-source-map',
        entry: {
            'index': resolve('./src/index.tsx')
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            onlyCompileBundledFiles: true,
                            configFile: resolve('./tsconfig.json')
                        }
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif|mp3|mp4)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.(html|txt|json)$/i,
                    type: 'asset/source'
                }
            ],

        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.jsx'],
            extensionAlias: {
                '.jsx': ['.tsx', '.jsx'],
                '.js': ['.ts', '.js']
            },
        },
        plugins: [
            new Webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('development'),
                'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
            })
        ],
    } satisfies Webpack.Configuration).pipe(
        map(config => config),
        map(config => new WebpackDevServer({
            static: {
                directory: resolve('./public')
            },
            historyApiFallback: {index: 'index.html'},   // Here to make it a single-page-app
            port: port || 1515,
            open: false,
            headers: {
                'Cache-Control': 'no-store',
            },
            // TODO: Look into not using proxying since I am not using CORS anymore
            // proxy: [{
            //     context: ['/api'],
            //     target: 'http://localhost:1234',
            //     pathRewrite: {'^/api': ''}
            // }]
        }, Webpack(config))),
        switchMap(server => server.start()),
    );

startWebapp(1515).subscribe();

