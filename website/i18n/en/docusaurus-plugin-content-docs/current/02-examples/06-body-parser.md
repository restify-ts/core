# 06-body-parser

To try this example, you should first [prepare the prerequisite][1].

You can run the application from the first terminal:

```bash
yarn start6
```

From the second terminal check the work:

```bash
curl -isS localhost:8080 -d '{"one":1}' -H 'content-type: application/json'
```

[1]: ./prerequisite
