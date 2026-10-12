/* Edit this file to change rates, contacts and copy. */

export const CONFIG = {
  phone: '+254 709 888 777',
  whatsapp: '254709888777',
  email: 'info@maridadymotors.com',
  usdToKes: 129, // update to the current rate
  // Estimates only. Confirm current KRA rates and CRSP values before quoting.
  rates: { duty: 0.25, excise: 0.2, vat: 0.16, idf: 0.025, rdl: 0.02 },
  origins: [
    { id: 'jp', name: 'Japan', shipping: 1100, note: 'Yokohama to Mombasa, about 4-5 weeks' },
    { id: 'uk', name: 'United Kingdom', shipping: 1600, note: 'Southampton to Mombasa, about 5-6 weeks' },
    { id: 'ae', name: 'UAE', shipping: 800, note: 'Jebel Ali to Mombasa, about 2-3 weeks' },
    { id: 'th', name: 'Thailand', shipping: 1300, note: 'Laem Chabang to Mombasa, about 4 weeks' },
  ],
}

export const STEPS = [
  { title: 'Tell us what you want', body: 'Share the make, model, budget and year range. We confirm what is realistic before any money moves.' },
  { title: 'We find and inspect', body: 'We source from auctions and dealers, then send you the auction sheet or inspection report and photos.' },
  { title: 'You approve, we buy', body: 'You pay the vehicle deposit. We bid or buy, and send you the purchase invoice.' },
  { title: 'Shipping to Mombasa', body: 'Roll-on/roll-off or container. You get the bill of lading and a tracking reference.' },
  { title: 'Clearing and duty', body: 'We handle KRA, KEBS and port clearing, and keep you updated on every payment.' },
  { title: 'Registration and handover', body: 'NTSA registration, number plates, then delivery in Nairobi or collection from our yard.' },
]

export const FAQS = [
  {
    q: 'How old can an imported car be?',
    a: 'Kenya currently allows passenger vehicles up to 8 years from the year of manufacture. Check the latest rule with us before you commit to a unit.',
  },
  {
    q: 'What do I pay and when?',
    a: 'A deposit at purchase, the balance before shipping, and duty and clearing costs when the vehicle arrives. You get a written breakdown at each stage.',
  },
  {
    q: 'Can I see the car before it ships?',
    a: 'Yes. We send the auction sheet or inspection report, plus photos and video. You approve before we buy.',
  },
  {
    q: 'How long does the whole process take?',
    a: 'Usually 6 to 10 weeks from purchase to registration, depending on the origin country and port congestion.',
  },
]

export const WHY_DIRECT = [
  ['No middleman markup', 'You pay the auction or dealer price plus a flat service fee we agree up front.'],
  ['Documents you can check', 'Auction sheets, export certificates and the bill of lading go to you, not just to us.'],
  ['Cleared and registered', 'One team handles KRA, KEBS, the port and NTSA, so nothing is left for you to chase.'],
]