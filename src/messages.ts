import OS from "os";
import chalk from "chalk";
import mapValues from "lodash.mapvalues";
import Handlebars from "handlebars";

import { LogLevel } from "./types";

Handlebars.registerHelper({
  em: (str: string) => `${chalk.hex("#FFFFAA")(str)}`,
  emi: (str: string) => `${chalk.hex("#FFFFAA").italic(str)}`,
  // i: (str: string) => `${chalk.italic(str)}`,
  u: (str: string) => `${chalk.underline(str)}`,
});

/**
 * Returns object with keys of template names and values of log level and squirrelly template function.
 * @ignore
 */
function getTemplates(): { [key in keyof typeof TEMPLATES]: [LogLevel, Handlebars.TemplateDelegate] } {
  const u = chalk.underline;
  const em = chalk.yellow;
  const { red, green } = chalk;

  const TEMPLATES = {
    fileCopy: [LogLevel.Debug, `  ↳  {{ em source }} → {{ em target }}`],
    fileOp: [LogLevel.Info, `File {{ op }}: {{ em file }}.`],
    fileNotOpExists: [LogLevel.Warn, `File ${u("not {{ op }}")}: '{{ em file }}' already exists.`],
    fileNotOpIsEqual: [LogLevel.Warn, `File ${u("not {{ op }}")}: {{ em file }} is not met requested equality condition.`],
    fileNotOpIsNotEqual: [LogLevel.Warn, `File ${u("not {{ op }}")}: {{ em file }} is not met requested non-equality condition.`],

    // data-file related messages
    dataFileNotChanged: [LogLevel.Info, `'{{ em file }}' is not changed and not saved. Use force to save unchanged files.`],
    dataFileSaved: [LogLevel.Info, `File saved: '{{ em file }}'`],
    dataFileUpdated: [LogLevel.Info, `Key {{ op }}: '{{ em file }}' '{{ em key }}' {{ op }}.`],
    dataFileNotUpdated: [
      LogLevel.Warn,
      `Key ${u("not {{ op }}")}: '{{ em file }}' '{{ emi key }}' ${u("not {{ op }}")} because of {{ u reasons }} condition(s).`,
    ],
    dataFileAssignFails: [LogLevel.Warn, `Key ${u("not {{ op }}")}: '{{ em file }}' '{{ emi key }}' is not an object.`],
    dataFileUpdatedWithValue: [LogLevel.Debug, `  ↳  Old: ${em("{{ old }}")} ${OS.EOL}            New: ${em("{{ new }}")}`],
    dataFileIfEqualTrue: [LogLevel.Debug, `ifEqual:     ${green("✓")} {{ emi key }} = {{ val }}`],
    dataFileIfEqualFalse: [LogLevel.Debug, `ifEqual:     ${red("✗")} {{ emi key }} ≠ {{ val }}`],
    dataFileIfNotEqualTrue: [LogLevel.Debug, `ifNotEqual:  ${green("✓")} {{ emi key }} ≠ {{ val }}`],
    dataFileIfNotEqualFalse: [LogLevel.Debug, `ifNotEqual:  ${red("✗")} {{ emi key }} = {{ val }}`],
    dataFileIfExistsTrue: [LogLevel.Debug, `ifExists:    ${green("✓")} {{ emi key }} exists.`],
    dataFileIfExistsFalse: [LogLevel.Debug, `ifExists:    ${red("✗")} {{ emi key }} does not exists.`],
    dataFileIfNotExistsTrue: [LogLevel.Debug, `ifNotExists: ${green("✓")} {{ emi key }} does not exists.`],
    dataFileIfNotExistsFalse: [LogLevel.Debug, `ifNotExists: ${red("✗")} {{ emi key }} exists.`],
  };

  return mapValues(TEMPLATES, i => [i[0], Handlebars.compile(i[1])]) as {
    [key in keyof typeof TEMPLATES]: [LogLevel, Handlebars.TemplateDelegate];
  };
}

export default getTemplates();
