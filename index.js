module.exports = async function sign(key, newName) {
console.log('START SIGN')
  var a = {
    _: [],
    sign: true,
    key: `pass:${process.env.PASSWORD}`,
    input: `/tmp/${key}`,
    output: `/tmp/${newName}`,
    secretName: `${process.env.SECRETNAME}`,
    tax: false,
    tsp: 'all',
    role: 'personal',
    detached: false
  }

  
  const agent = require("./agent");
  await agent
      .main(a)
console.log('END SIGN')
}

module.exports = require("./index")


