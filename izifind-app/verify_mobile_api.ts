import { getCategories, getCommissariats, getObjects } from './src/services/catalog';

async function verifyMobileCommunication() {
  console.log("=== Verifying Mobile-to-Backend Communication ===");
  
  try {
    console.log("1. Fetching categories via mobile catalog service...");
    const categories = await getCategories();
    console.log(`[OK] Successfully retrieved ${categories.length} categories.`);
    console.log("Categories list:", categories.map(c => c.name));
  } catch (err: any) {
    console.error("[FAIL] Error fetching categories:", err.message || err);
  }

  try {
    console.log("\n2. Fetching commissariats via mobile catalog service...");
    const commissariats = await getCommissariats();
    console.log(`[OK] Successfully retrieved ${commissariats.length} commissariats.`);
    console.log("Commissariats list:", commissariats.map(c => c.name));
  } catch (err: any) {
    console.error("[FAIL] Error fetching commissariats:", err.message || err);
  }

  try {
    console.log("\n3. Fetching objects list via mobile catalog service...");
    const objects = await getObjects();
    console.log(`[OK] Successfully retrieved ${objects.length} objects.`);
  } catch (err: any) {
    console.error("[FAIL] Error fetching objects:", err.message || err);
  }
}

verifyMobileCommunication();
