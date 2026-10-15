/* Demo seed data. store.js persists any edits on top of this in localStorage. */
const SEED = (() => {
  let seed = 42;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const int = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
  const daysAgo = n => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const FIRST = ['Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia', 'Aiden',
    'Amelia', 'James', 'Harper', 'Benjamin', 'Evelyn', 'Elijah', 'Abigail', 'Henry', 'Zara', 'Omar', 'Aisha', 'Yusuf'];
  const LAST = ['Smith', 'Johnson', 'Khan', 'Brown', 'Garcia', 'Miller', 'Davis', 'Rahman', 'Wilson', 'Anderson',
    'Thomas', 'Taylor', 'Moore', 'Martin', 'Lee', 'Ali', 'Clark', 'Lewis'];
  const COUNTRIES = ['United States', 'United Kingdom', 'Bangladesh', 'Canada', 'Germany', 'Australia', 'India', 'France'];
  const ROLES = ['Admin', 'Editor', 'Author', 'Maintainer', 'Subscriber'];
  const PLANS = ['Basic', 'Team', 'Company', 'Enterprise'];
  const MODULES = ['User Management', 'Content Management', 'Disputes Management', 'Database Management',
    'Financial Management', 'Reporting', 'API Control', 'Repository Management', 'Payroll'];

  const people = [];
  const used = new Set();
  while (people.length < 60) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    if (!used.has(name)) { used.add(name); people.push(name); }
  }
  const emailOf = name => `${name.toLowerCase().replace(' ', '.')}@example.com`;
  const phone = () => `+1 (${int(200, 989)}) ${int(200, 999)}-${int(1000, 9999)}`;

  const users = people.slice(0, 40).map((name, i) => ({
    id: i + 1,
    name,
    email: emailOf(name),
    username: `${name.split(' ')[0].toLowerCase()}${int(10, 99)}`,
    role: i === 0 ? 'Admin' : pick(ROLES),
    plan: pick(PLANS),
    status: i === 0 ? 'Active' : pick(['Active', 'Active', 'Pending', 'Inactive']),
    country: pick(COUNTRIES),
    phone: phone(),
    joined: daysAgo(int(10, 700))
  }));

  const customers = people.slice(20, 60).map((name, i) => ({
    id: i + 1, name, email: emailOf(name), country: pick(COUNTRIES), phone: phone(), joined: daysAgo(int(30, 900))
  }));

  const categories = [
    ['Smartphones', 'Choose from a wide range of smartphones.'],
    ['Laptops', 'Powerful laptops for work and play.'],
    ['Audio', 'Headphones, earbuds and speakers.'],
    ['Wearables', 'Smart watches and fitness trackers.'],
    ['Accessories', 'Chargers, cables, cases and more.'],
    ['Gaming', 'Consoles, controllers and games.'],
    ['Home', 'Smart home devices and appliances.'],
    ['Cameras', 'Digital cameras and lenses.']
  ].map(([name, description], i) => ({ id: i + 1, name, description }));

  const products = [
    ['iPhone 15 Pro', 'Smartphones', 999], ['Galaxy S24', 'Smartphones', 899], ['Pixel 8', 'Smartphones', 699],
    ['MacBook Air M3', 'Laptops', 1099], ['Dell XPS 13', 'Laptops', 1199], ['ThinkPad X1', 'Laptops', 1399],
    ['AirPods Pro', 'Audio', 249], ['Sony WH-1000XM5', 'Audio', 399], ['JBL Flip 6', 'Audio', 129],
    ['Apple Watch S9', 'Wearables', 399], ['Fitbit Charge 6', 'Wearables', 159], ['Garmin Venu 3', 'Wearables', 449],
    ['USB-C Charger 65W', 'Accessories', 49], ['MagSafe Case', 'Accessories', 59], ['HDMI Cable 2m', 'Accessories', 19],
    ['PlayStation 5', 'Gaming', 499], ['Xbox Controller', 'Gaming', 59], ['Nintendo Switch', 'Gaming', 299],
    ['Echo Dot', 'Home', 49], ['Nest Thermostat', 'Home', 129], ['Ring Doorbell', 'Home', 99],
    ['Canon EOS R50', 'Cameras', 679], ['GoPro Hero 12', 'Cameras', 399], ['Sony 50mm f/1.8', 'Cameras', 249]
  ].map(([name, category, price], i) => ({
    id: i + 1, name, category, price,
    sku: String(int(10000, 99999)),
    qty: int(0, 900),
    status: pick(['Published', 'Published', 'Scheduled', 'Inactive']),
    inStock: rnd() > .2,
    description: `${name} from our ${category.toLowerCase()} range.`
  }));

  const orders = Array.from({ length: 60 }, (_, i) => ({
    id: 5400 + i,
    date: daysAgo(int(0, 180)),
    customerId: int(1, customers.length),
    items: Array.from({ length: int(1, 3) }, () => ({ productId: int(1, products.length), qty: int(1, 3) })),
    payment: pick(['Paid', 'Paid', 'Paid', 'Pending', 'Failed', 'Cancelled']),
    status: pick(['Delivered', 'Delivered', 'Out for delivery', 'Ready to pickup', 'Dispatched']),
    method: pick(['Mastercard', 'Visa', 'PayPal'])
  })).sort((a, b) => b.date.localeCompare(a.date));

  const SERVICES = [['Website design', 1500], ['Mobile app UI', 2200], ['SEO audit', 600], ['Hosting (annual)', 240],
    ['Logo design', 450], ['Maintenance retainer', 800], ['Copywriting', 350], ['Branding package', 1200]];
  const invoices = Array.from({ length: 30 }, (_, i) => {
    const issued = int(5, 200);
    const client = people[int(0, 59)];
    return {
      id: 4980 + i,
      client,
      email: emailOf(client),
      company: pick(['Hall-Robbins PLC', 'Acme Corp', 'Globex', 'Initech', 'Umbrella Ltd', 'Stark Industries', 'Wayne Enterprises']),
      address: `${int(10, 999)} Market Street, Suite ${int(100, 600)}`,
      issued: daysAgo(issued),
      due: daysAgo(issued - 30),
      items: Array.from({ length: int(1, 3) }, () => { const [desc, price] = pick(SERVICES); return { desc, qty: int(1, 2), price }; }),
      discount: 0,
      tax: pick([0, 5, 10]),
      status: pick(['Paid', 'Paid', 'Sent', 'Draft', 'Past Due', 'Partial Payment']),
      notes: 'Thank you for your business!'
    };
  }).sort((a, b) => b.id - a.id);

  const roles = ROLES.map((name, i) => ({
    id: i + 1,
    name,
    permissions: Object.fromEntries(MODULES.map(m => [m, { read: true, write: i < 3 && rnd() > .3, create: i < 2 && rnd() > .4 }]))
  }));

  const permissions = [
    ['Management', ['Admin']], ['Manage Billing & Roles', ['Admin']], ['Add & Remove Users', ['Admin', 'Maintainer']],
    ['Project Planning', ['Admin', 'Editor', 'Author']], ['Manage Email Sequences', ['Admin', 'Editor']],
    ['Client Communication', ['Admin', 'Maintainer']], ['Only View', ['Admin', 'Subscriber']],
    ['Financial Management', ['Admin', 'Editor']], ["Manage Others' Tasks", ['Admin', 'Author']]
  ].map(([name, assignedTo], i) => ({ id: i + 1, name, assignedTo, created: daysAgo(int(10, 400)) }));

  const on = n => daysAgo(-n);
  const events = [
    { id: 1, title: 'Design Review', start: on(-3), calendar: 'Business' },
    { id: 2, title: 'Meeting With Client', start: on(-1), calendar: 'Business' },
    { id: 3, title: 'Family Trip', start: on(2), end: on(5), calendar: 'Family' },
    { id: 4, title: "Doctor's Appointment", start: `${on(4)}T10:00`, calendar: 'Personal' },
    { id: 5, title: 'Dart Game', start: on(6), calendar: 'ETC' },
    { id: 6, title: 'Public Holiday', start: on(9), calendar: 'Holiday' },
    { id: 7, title: 'Product Launch', start: `${on(0)}T14:00`, calendar: 'Business' },
    { id: 8, title: 'Monthly Meeting', start: on(12), calendar: 'Business' },
    { id: 9, title: 'Dinner', start: `${on(-6)}T19:30`, calendar: 'Family' },
    { id: 10, title: 'Gym', start: on(-8), calendar: 'Personal' }
  ];

  const SUBJECTS = [
    ['Your order has shipped', 'Good news! Your order #5412 is on its way and should arrive within 3–5 business days.'],
    ['Meeting notes — Q3 planning', "Hi team, attached are the notes from today's planning session. Please review the action items before Friday."],
    ['Invoice #4991 is due', 'This is a friendly reminder that invoice #4991 is due next week.'],
    ['Welcome to the team!', "We're thrilled to have you on board. Your onboarding schedule is below."],
    ['Design feedback', 'I had a look at the new dashboard mockups — great work overall. A few notes on spacing and colours inline.'],
    ['Weekly report', "Here's the weekly performance summary: traffic up 12%, conversions up 4%."],
    ['Password changed', "Your account password was changed. If this wasn't you, contact support immediately."],
    ['Lunch on Friday?', "Are you free for lunch this Friday? There's a new place downtown."],
    ['Server maintenance window', 'Scheduled maintenance will occur Sunday 02:00–04:00 UTC.'],
    ['Contract renewal', 'Please find the updated contract for the next term attached for your signature.']
  ];
  const emails = Array.from({ length: 24 }, (_, i) => {
    const [subject, body] = SUBJECTS[i % SUBJECTS.length];
    const from = people[int(0, 59)];
    const d = new Date();
    d.setHours(d.getHours() - i * 7 - int(0, 5));
    return {
      id: i + 1, from, email: emailOf(from), subject, body, date: d.toISOString(),
      folder: i < 16 ? 'inbox' : pick(['sent', 'draft', 'spam', 'trash']),
      label: pick(['personal', 'company', 'important', 'private']),
      read: rnd() > .4, starred: rnd() > .75
    };
  });

  const CHAT_LINES = ['Hey! How are you doing?', 'Did you get a chance to look at the report?', "Sure, I'll send it over in a bit.",
    'Thanks, that would be great.', 'Can we move the call to 3pm?', 'Works for me 👍', 'The new design looks amazing!',
    'Let me check with the team and get back to you.'];
  const chats = people.slice(0, 8).map((name, i) => ({
    id: i + 1, name,
    about: pick(['UI/UX Designer', 'Frontend Developer', 'Project Manager', 'Marketing Lead', 'Product Owner', 'QA Engineer']),
    status: pick(['online', 'away', 'offline']),
    unread: i < 3 ? int(1, 3) : 0,
    messages: Array.from({ length: int(3, 7) }, (_, j) => ({
      me: j % 2 === 1, text: pick(CHAT_LINES), time: new Date(Date.now() - (10 - j) * 36e5 - i * 864e5).toISOString()
    }))
  }));

  const kanban = [
    { id: 'c1', title: 'In Progress', items: [
      { id: 't1', title: 'Research FAQ page UX', label: 'UX', attachments: 4, comments: 12, assigned: ['AL', 'BK'] },
      { id: 't2', title: 'Review Javascript code', label: 'Code Review', attachments: 2, comments: 8, assigned: ['CM', 'DN'] }
    ] },
    { id: 'c2', title: 'In Review', items: [
      { id: 't3', title: 'Review completed Apps', label: 'Dashboard', attachments: 8, comments: 17, assigned: ['EO', 'FP'] },
      { id: 't4', title: 'Find new product images', label: 'Images', attachments: 10, comments: 12, assigned: ['GQ'], image: true }
    ] },
    { id: 'c3', title: 'Done', items: [
      { id: 't5', title: 'Forms & Tables section', label: 'App', attachments: 1, comments: 4, assigned: ['HR', 'IS', 'JT'] },
      { id: 't6', title: 'Completed Charts & Maps', label: 'Charts & Maps', attachments: 6, comments: 21, assigned: ['KU'] }
    ] }
  ];

  const profile = {
    firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', org: 'Nexus Inc.', phone: '+1 (202) 555-0111',
    address: '221B Baker Street', state: 'California', zip: '94016', country: 'United States', language: 'English',
    timezone: '(GMT-08:00) Pacific Time', currency: 'USD', avatar: ''
  };

  const notifications = [
    ['New for you', true, true, true], ['Account activity', true, true, true],
    ['A new browser used to sign in', true, true, false], ['A new device is linked', true, false, false]
  ].map(([type, email, browser, app]) => ({ type, email, browser, app }));

  return {
    users, customers, categories, products, orders, invoices, roles, permissions, events, emails, chats, kanban,
    profile, notifications,
    lookups: { countries: COUNTRIES, roles: ROLES, plans: PLANS, modules: MODULES }
  };
})();
