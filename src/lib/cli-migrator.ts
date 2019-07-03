import {
  Migrator, MySQLMigrator, DataContext, MySQLDataContext,
  ConnectionsFileReader, FormnMigration
} from 'formn';

/**
 * Handles database migration commands.
 */
export class CLIMigrator {
  private dataContexts: DataContext[] = [];
  private migrators: Migrator[] = [];

  /**
   * Initialize the migrator.
   */
  constructor(
    private connFile: string,
    private flavor: string,
    private migDir: string) {
  }

  /**
   * Connect to the database(s), create the migrations directory, and create
   * the migrations table.
   */
  async initialize(): Promise<void> {
    const connFileReader = new ConnectionsFileReader();
    const connOpts       = await connFileReader
      .readConnectionOptions(this.connFile);

    if (this.flavor === 'mysql') {
      this.dataContexts = await Promise
        .all(connOpts.map(connOpts => new MySQLDataContext()
          .connect(connOpts)));

      this.migrators = this.dataContexts
        .map(dc => new MySQLMigrator(dc, this.migDir));
    }
    else
      throw new Error(`Unsupported database flavor "${this.flavor}."`);

    try {
      // Make the migrations directory.
      this.migrators[0].createMigrationsDir();

      // Make the migrations table in each database, one at a time.
      for (let i = 0; i < this.migrators.length; ++i)
        await this.migrators[i].createMigrationsTable();
    }
    catch (err) {
      console.error('Error initializing CLIMigrator.', err);

      await this.end();

      throw err;
    }
  }

  /**
   * Tear down the connections.
   */
  end(): Promise<void[]> {
    return Promise
      .all(this.dataContexts
        .map(dc => dc.end()));
  }

  /**
   * Create a migration script.
   * @param migName - The name of the migration script to create, which will be
   * prefixed with a timestamp.
   */
  async create(migName: string): Promise<void> {
    await this.initialize();

    try {
      await this.migrators[0].create(migName);
    }
    finally {
      await this.end();
    }
  }

  /**
   * Migrate the database up.
   */
  async up(): Promise<any> {
    await this.initialize();

    try {
      for (let migrator of this.migrators)
        await migrator.up();
    }
    finally {
      await this.end();
    }
  }

  /**
   * Migrate the database down (bring down the last migration).
   */
  async down(): Promise<any> {
    await this.initialize();

    try {
      for (let migrator of this.migrators)
        await migrator.down();
    }
    finally {
      await this.end();
    }
  }

  /**
   * Run a migration script.
   */
  async run(migScript: string): Promise<any> {
    await this.initialize();

    try {
      for (let migrator of this.migrators)
        await migrator.run(migScript);
    }
    finally {
      await this.end();
    }
  }
}
