# VISTA

VISTA - Visual Interpretative Semantic Tagging Application

To run the UI with

```bash
cd vista && yarn install
```

Before running the App, you need to start the SimpleAnnotationServer as local instance.

To start the [SimpleAnnotationServer](https://github.com/glenrobson/SimpleAnnotationServer), point to the folder which contains the file `simpleAnnotationStore.war` and run

```bash
java -jar dependency/jetty-runner.jar --port 8888 simpleAnnotationStore.war
```

To run the App

```bash
yarn start
```
