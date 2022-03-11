const chalk = require('chalk')

export function errorlog(message: string) {
  console.error(chalk.red('✖ ' + message))
}

export function successlog(message: string) {
  console.error(chalk.green('✔ ' + message))
}


export function warnlog(message: string) {
  console.error(chalk.yellow('⚠ ' + message))
}