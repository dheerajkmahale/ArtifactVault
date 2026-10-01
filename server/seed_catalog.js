import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { generateTextEmbedding } from './services/gemini.js';

dotenv.config();

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/artifactvault');
  const dheerajId = new mongoose.Types.ObjectId('6abd01e6eeba6172d324defe');

  // Set all artifacts to dheeraj's account so gallery has a rich variety
  await mongoose.connection.db.collection('artifacts').updateMany({}, { $set: { owner: dheerajId } });

  const updates = [
    {
      id: '6abd06f1eeba6172d324df09',
      title: 'Athenian Silver Tetradrachm Coin',
      description: 'Classical Greek silver coin featuring the helmeted head of Athena and owl of wisdom with olive sprig, minted in ancient Athens.',
      classification: {
        category: 'Ancient Coin',
        confidence: 96,
        era: 'Classical Greece (~450 BCE)',
        region: 'Athens, Attica',
        material: 'High-purity Silver (AR)',
        condition: 'Extremely Fine (XF)',
        description: 'Classical Greek silver coin featuring the helmeted head of Athena and owl of wisdom with olive sprig, minted in ancient Athens.'
      },
      curatorVerified: false
    },
    {
      id: '6abd0b74eeba6172d324df36',
      title: 'Mycenaean Inlaid Bronze Dagger',
      description: 'Late Bronze Age ceremonial thrusting dagger with niello and electrum inlay depicting a lion hunt in the Aegean tradition.',
      classification: {
        category: 'Bronze Weapon',
        confidence: 94,
        era: 'Late Helladic III (~1300 BCE)',
        region: 'Peloponnese, Greece',
        material: 'Cast Bronze with Gold & Silver Inlay',
        condition: 'Archaeological Patina with Intact Hilt',
        description: 'Late Bronze Age ceremonial thrusting dagger with niello and electrum inlay depicting a lion hunt in the Aegean tradition.'
      },
      curatorVerified: false
    },
    {
      id: '6abd0bc4eeba6172d324df44',
      title: 'Minoan Steatite Bull Head Rhyton',
      description: 'Neopalatial ritual libation vessel carved from black steatite with gilded horns and inlaid shell muzzle, discovered at Knossos.',
      classification: {
        category: 'Ritual Vessel',
        confidence: 91,
        era: 'Neopalatial Minoan (~1550 BCE)',
        region: 'Crete, Knossos',
        material: 'Carved Chlorite Steatite & Gold Leaf',
        condition: 'Partially Restored Ceremonial Vessel',
        description: 'Neopalatial ritual libation vessel carved from black steatite with gilded horns and inlaid shell muzzle, discovered at Knossos.'
      },
      curatorVerified: false
    },
    {
      id: '6abde162ceb2e8d87deb2de9',
      title: 'Classical Greek Corinthian Helmet',
      description: 'Archaeological bronze helmet with natural malachite patina, forehead gorgoneion, and protective cheek pieces dating from the Greco-Persian wars.',
      classification: {
        category: 'Bronze Weapon',
        confidence: 95,
        era: 'Archaic / Classical Greece (~500 BCE)',
        region: 'Peloponnese, Corinth',
        material: 'Hammered Sheet Bronze Alloy',
        condition: 'Museum Grade Patinated Bronze',
        description: 'Archaeological bronze helmet with natural malachite patina, forehead gorgoneion, and protective cheek pieces dating from the Greco-Persian wars.'
      },
      curatorVerified: false
    }
  ];

  for (const item of updates) {
    console.log(`Generating Gemini embedding for "${item.title}"...`);
    const embedding = await generateTextEmbedding(item.description);
    console.log(`- Got embedding vector with ${embedding.length} dimensions`);
    await mongoose.connection.db.collection('artifacts').updateOne(
      { _id: new mongoose.Types.ObjectId(item.id) },
      {
        $set: {
          title: item.title,
          description: item.description,
          classification: item.classification,
          curatorVerified: item.curatorVerified,
          descriptionEmbedding: embedding
        }
      }
    );
  }

  console.log('All 4 artifacts updated with Gemini vector embeddings and rich catalog metadata.');
  await mongoose.disconnect();
}

run().catch(console.error);
