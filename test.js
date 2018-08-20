async.map(
    files,
    (file, cb) => {
      fs.readFile(file, (err, data) => {
        if (err) {
          cb(err)
        } else {
          parser.parseString(data, (err, result) => {
            cb(err, result.planes.plane)
          })
        }
      })
    },
    function (err, results) {
      if (err) {
        throw err
      } else {
        let output = JSON.stringify(results)
        fs.writeFile('output.json', output, 'utf8', (err) => {
          if (err) {
            throw err
          } else {
            console.log('file created...')
          }
        })
      }
    }
  )