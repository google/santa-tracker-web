<!DOCTYPE html>
<html lang="en">
<head>
    <title>Scene: %(sceneName)s</title>
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, user-scalable=no">
    <style>
        html, body {
            font-family: Roboto, sans-serif;
            font-size: 12px;
            overflow: hidden;
            height: 100%%;
            width: 100%%;
            margin: 0;
            padding: 0;
            background-color: #3ec4f0;
            position: absolute;
            -webkit-tap-highlight-color: rgba(0,0,0,0);
        }
    </style>

    <script src="../../components/webcomponentsjs/webcomponents-lite.min.js"></script>
    <link rel="import" href="../../elements/elements_en.html" />
</head>
<body>
%(content)s

    <dev-santa-app>
        <%(sceneName)s-scene></%(sceneName)s-scene>
    </dev-santa-app>
</body>
</html>
