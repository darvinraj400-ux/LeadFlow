import 'dotenv/config';

// Layer 1 stub — demo seeding lands in a later layer (after the schema exists).
async function main(): Promise<void> {
  console.log('seed-demo: stub — nothing to seed yet (Layer 1).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
