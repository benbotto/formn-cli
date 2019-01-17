import { MySQLModelGenerator, MySQLDataContext, ConnectionsFileReader } from 'formn';

/**
 * Generates and writes entity models.
 */
export class CLIModelGenerator {
  /**
   * Generate and write the entity model files.
   */
  async generateModels(
    connFile: string,
    entityDir: string,
    flavor: string): Promise<void> {

    const connFileReader = new ConnectionsFileReader();
    const connOpts       = await connFileReader
      .readConnectionOptions(connFile);

    if (flavor === 'mysql') {
      for (let i = 0; i < connOpts.length; ++i) {
        const connOptsClone = Object.assign({}, connOpts[i]);
        const dc            = new MySQLDataContext();

        connOptsClone.database = 'INFORMATION_SCHEMA';

        await dc.connect(connOptsClone);

        try {
          await new MySQLModelGenerator(dc)
            .generateModels(connOpts[i].database, entityDir);
        }
        finally {
          await dc.end();
        }
      }
    }
    else {
      throw new Error(`Unsupported database flavor "${flavor}."`);
    }
  }
}

