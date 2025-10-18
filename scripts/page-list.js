const File = require('vinyl')

module.exports.register = function ({ config }) {

  const logger = this.getLogger('page-list')
  
  this
  .on('documentsConverted', ({ config }) => {

    const { contentCatalog, siteCatalog } = this.getVariables()

    let pageList = {}

    // add files to page list
    const myFiles = contentCatalog.getFiles()
    myFiles.forEach( (file) => {

      if (!file.out || !file.src.path) {
        return
      }

      pageList[file.src.path] = {
        title: file.asciidoc?.doctitle,
        url: file.out.path,
      }
    })

    // add component versions to page list
    const components = contentCatalog.getComponents()
    const urls = componentsToArray(components);

    pageList["componentVersions"] = { urls }

    const pageListFile = generateChangelogFile(pageList)
    siteCatalog.addFile(pageListFile)
    logger.info({   }, 'Page list generated')
  })
}

function generateChangelogFile (pageList) {
    return new File({ contents: Buffer.from(JSON.stringify(pageList)), out: { path: './.meta/pageList' } })
}

function componentsToArray(components) {

  const urlArray = Object.keys(components).reduce((accumulator, key) => {
    const url = components[key].versions.map(version => `${version.url}`);
    accumulator.push(...url);
    return accumulator;
  }, []);

  return urlArray

}
