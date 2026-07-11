import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

dotenv.config();

const usersData = [
  {
    name: 'Administrator',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    isVerified: true
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    isVerified: true
  }
];

const categoriesData = [
  { name: 'Electronics', slug: 'electronics', description: 'Premium audio, monitors, smart controllers, and power solutions.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Mobiles', slug: 'mobiles', description: 'Top tier 5G smartphones, power banks, cases, and charging docks.', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80' },
  { name: 'Laptops', slug: 'laptops', description: 'Developer ultrabooks, gaming rigs, study laptops, and premium sleeves.', image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80' },
  { name: 'Fashion (Men & Women)', slug: 'fashion', description: 'Winter coats, biker jackets, sweaters, dresses, and activewear.', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&auto=format&fit=crop&q=80' },
  { name: 'Shoes', slug: 'shoes', description: 'Cloud running trainers, leather boots, loafers, and lounge slides.', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' },
  { name: 'Watches', slug: 'watches', description: 'Automatic mechanical watches, smart wearables, and chronographs.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { name: 'Beauty', slug: 'beauty', description: 'Hydrating face serums, night creams, organic scrub packs, and lip balms.', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80' },
  { name: 'Grocery', slug: 'grocery', description: 'Extra virgin olive oil, coffee beans, wildflower honey, and organic grains.', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Ceramic nonstick cookware, floor lamps, knit throws, and kitchen blocks.', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80' },
  { name: 'Furniture', slug: 'furniture', description: 'Scandinavian armchairs, nesting coffee tables, bookshelves, and writing desks.', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80' },
  { name: 'Books', slug: 'books', description: 'Hardcover novels, algorithm manuals, cookbooks, and astronomical guides.', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80' },
  { name: 'Toys', slug: 'toys', description: 'Wooden stacking rainbows, weighted plush Koalas, and model RC cars.', image: 'https://images.unsplash.com/photo-1566576912321-d58edd7a2808?w=600&auto=format&fit=crop&q=80' },
  { name: 'Sports', slug: 'sports', description: 'Adjustable dumbbell weights, speed jump ropes, and muscle foam rollers.', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80' },
  { name: 'Accessories', slug: 'accessories', description: 'Canvas utility packs, leather RFID wallets, desk pads, and sun hats.', image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=600&auto=format&fit=crop&q=80' },
  { name: 'Gaming', slug: 'gaming', description: 'RGB mechanical keypads, streaming condenser microphones, and VR headsets.', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80' },
  { name: 'Health', slug: 'health', description: 'Air purifiers, smart scales, white noise therapy, and massage guns.', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&auto=format&fit=crop&q=80' }
];

const couponsData = [
  { code: 'SAVE10', discountPercentage: 10, expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), active: true },
  { code: 'WELCOME20', discountPercentage: 20, expirationDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), active: true },
  { code: 'SUMMER50', discountPercentage: 50, expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), active: true }
];

// 320 completely unique Unsplash image IDs (20 per category * 16 categories)
const unsplashPhotoPool = {
  'electronics': [
    'photo-1505740420928-5e560c06d30e', 'photo-1527443224154-c4a3942d3acf', 'photo-1587829741301-dc798b83add3',
    'photo-1585565800602-f1194ecd8f66', 'photo-1586495777744-4413f21062fa', 'photo-1611532736597-de2d4265fba3',
    'photo-1590658268037-6bf12165a8df', 'photo-1603252109303-2751441dd157', 'photo-1542751371-adc38448a05e',
    'photo-1618220179428-22790b461013', 'photo-1563206767-5b18f218e8de', 'photo-1572922116031-64d8a57173b2',
    'photo-1546435770-a3e426bf472b', 'photo-1618384887929-16ec33fab9ef', 'photo-1608156639585-b3a032ef9689',
    'photo-1594636797501-ef436e21808a', 'photo-1544244015-0df4b3ffc6b0', 'photo-1524362040127-1f1910eeef2c',
    'photo-1588156979435-379b9d802b0a', 'photo-1605648916319-cf082f7524a1'
  ],
  'mobiles': [
    'photo-1511707171634-5f897ff02aa9', 'photo-1598327105666-5b89351aff97', 'photo-1565849906660-af84c47a61d0',
    'photo-1580910051074-3eb694886505', 'photo-1592899677977-9c10ca588bbd', 'photo-1573148195900-7845dcb9b127',
    'photo-1583573636246-18cb2246697f', 'photo-1605787020600-b9ebd5df1d07', 'photo-1510557880182-3d4d3cba35a5',
    'photo-1512941937669-90a1b58e7e9c', 'photo-1584438784894-089d6a128f3e', 'photo-1551645121-d1034da75057',
    'photo-1548036328-c9fa89d128fa', 'photo-1597740985671-2a77b08f5413', 'photo-1517430816045-df4b7de11d1d',
    'photo-1609081219090-a6d81d3085bf', 'photo-1574755393849-623942496936', 'photo-1616348436168-de43ad0db179',
    'photo-1557180295-76eee20ae8aa', 'photo-1562259949-e8e7689d7828'
  ],
  'laptops': [
    'photo-1531297484001-80022131f5a1', 'photo-1496181130204-755241544e35', 'photo-1603302576837-37561b2e2302',
    'photo-1588872657578-7efd1f1555ed', 'photo-1611186871348-b1ce696e52c9', 'photo-1525373612132-b3e277947ef8',
    'photo-1498050108023-c5249f4df085', 'photo-1541807084-5c52b6b3adef', 'photo-1504707748692-419802cf939d',
    'photo-1587614382346-4ec70e388b28', 'photo-1618424181497-157f25b6ddd5', 'photo-1593642702821-b88d549d9a40',
    'photo-1515248184666-41e4a7af69e5', 'photo-1537498425277-c283d32ef9db', 'photo-1522252234503-e356532cafd5',
    'photo-1499951360447-b19be8fe80f5', 'photo-1542744095-291d1f67b221', 'photo-1516321318423-f06f85e504b3',
    'photo-1544005313-94ddf0286df2', 'photo-1454165804606-c3d57bc86b40'
  ],
  'fashion': [
    'photo-1539109136881-3be0616acf4b', 'photo-1496345875659-11f7dd282d1d', 'photo-1434389677669-e08b4cac3105',
    'photo-1483985988355-763728e1935b', 'photo-1509319117193-57bab727e09d', 'photo-1525507119028-ed4c629a60a3',
    'photo-1515886657613-9f3515b0c78f', 'photo-1479064555552-3ef4979f8908', 'photo-1554568218-0f1715e72254',
    'photo-1485968579580-b6d095142e6e', 'photo-1485462537746-965f33f7f6a7', 'photo-1512436991641-6745cdb1723f',
    'photo-1509551388413-e18d0ac5d495', 'photo-1516762689617-e1cffcef479d', 'photo-1507679799987-c73779587ccf',
    'photo-1511556532299-8f662fc26c06', 'photo-1490481651871-ab68de25d43d', 'photo-1469334031218-e382a71b716b',
    'photo-1544441893-675973e31985', 'photo-1475180098004-ca77a66b28ae'
  ],
  'shoes': [
    'photo-1542291026-7eec264c27ff', 'photo-1606107557195-0e29a4b5b4aa', 'photo-1608231387042-66d1773070a5',
    'photo-1595950653106-6c9ebd614d3a', 'photo-1539185441755-769473a23570', 'photo-1560769629-975ec94e6a86',
    'photo-1514989940723-e8e51635b782', 'photo-1516478177764-9fe5bd7e9717', 'photo-1600185365483-26d7a4cc7519',
    'photo-1551107696-a4b0c5a0d9a2', 'photo-1520639888713-7851133b1ed0', 'photo-1460353581641-37badd452426',
    'photo-1549298916-b41d501d3772', 'photo-1534653270118-79c7d6b87e22', 'photo-1518049360754-7015b6821a71',
    'photo-1515645121114-114df34ba44b', 'photo-1556906781-9a412961c28c', 'photo-1597045566677-8cf032ed6634',
    'photo-1512374382149-233c42b6a83b', 'photo-1491596589218-59b43c5b8b64'
  ],
  'watches': [
    'photo-1523275335684-37898b6baf30', 'photo-1524592094714-0f0654e20314', 'photo-1612817288484-6f916006741a',
    'photo-1614162692292-7ac56d7f7f1e', 'photo-1547996160-81dfa63595aa', 'photo-1508685096489-7aacd43bd3b1',
    'photo-1539874754764-5a96559165b0', 'photo-1495856458515-083d1a86130d', 'photo-1546868871-7041f2a55e12',
    'photo-1617038260897-41a1f14a8ca0', 'photo-1619134778706-7015533a6150', 'photo-1509048191080-d2984bad6ae5',
    'photo-1522312346375-d1a52e2b99b3', 'photo-1533139581453-097d7c11a53b', 'photo-1542496658-e33a6d0d50f6',
    'photo-1451290337906-ac9351894217', 'photo-1509048191080-d2984bad6ae5', 'photo-1618424181497-157f25b6ddd5',
    'photo-1518131394557-b3977a4a92d2', 'photo-1507679799987-c73779587ccf'
  ],
  'beauty': [
    'photo-1556228720-195a672e8a03', 'photo-1598440947619-2c35fc9aa908', 'photo-1608248597481-496100c8c836',
    'photo-1601049541289-9b1b7bbbfe19', 'photo-1570172619644-dfd03ed5d881', 'photo-1526947425960-945c6e72858f',
    'photo-1617897903246-719242758050', 'photo-1620916566398-39f1143ab7be', 'photo-1616683693504-3ea7e9ad6fec',
    'photo-1596462502278-27bfdc403348', 'photo-1615396879835-53379549f2b8', 'photo-1608248597481-496100c8c836',
    'photo-1611080626919-7cf5a9dbab5b', 'photo-1620916566398-39f1143ab7be', 'photo-1617897903246-719242758050',
    'photo-1624454021490-e0c83d61a9c2', 'photo-1590156546746-c588a113f6f3', 'photo-1619551465242-174ec7b86000',
    'photo-1596462502278-27bfdc403348', 'photo-1571781926291-c477ebfd024b'
  ],
  'grocery': [
    'photo-1542838132-92c53300491e', 'photo-1471193945509-9ad0617afabf', 'photo-1578916171728-46686eac8d58',
    'photo-1506084868230-bb9d95c24759', 'photo-1608686207856-001b95cf60ca', 'photo-1588964895597-cfccd6e2dbf9',
    'photo-1607349913338-fca6f7fc42d0', 'photo-1543083477-4f7fe1903eb5', 'photo-1610832958506-ee56336191a1',
    'photo-1601004890684-d8cbf643f5f2', 'photo-1574316071802-0d684efa7bf5', 'photo-1590080875515-8a3a8dc5735e',
    'photo-1542838132-92c53300491e', 'photo-1586201375761-83865001e31c', 'photo-1595855759920-86582396756a',
    'photo-1509440159596-0249088772ff', 'photo-1515003197210-e0cd71810b5f', 'photo-1606787366850-de6330128bfc',
    'photo-1596040033229-a9821ebd058d', 'photo-1498837167922-ddd27525d352'
  ],
  'home-kitchen': [
    'photo-1583847268964-b28dc8f51f92', 'photo-1556911220-e15b29be8c8f', 'photo-1596040033229-a9821ebd058d',
    'photo-1502672260266-1c1ef2d93688', 'photo-1584269600464-37b1b58a9fe7', 'photo-1590794056226-79ef3a8147e1',
    'photo-1534349762230-e0cadf78f5da', 'photo-1540555700478-4be289fbecef', 'photo-1522336572018-1ba49d82e1b8',
    'photo-1581428982868-e410dd047a90', 'photo-1507089947368-19c1da9775ae', 'photo-1565183997392-2f6f122e5912',
    'photo-1513694203232-719a280e022f', 'photo-1505691938895-1758d7feb511', 'photo-1550581190-9c1c48d21d6c',
    'photo-1600585154340-be6161a56a0c', 'photo-1588854337236-6889d631faa8', 'photo-1563245372-f21724e3856d',
    'photo-1556912173-3bb406ef7e77', 'photo-1540555700478-4be289fbecef'
  ],
  'furniture': [
    'photo-1567538096630-e0c55bd6374c', 'photo-1581428982868-e410dd047a90', 'photo-1595515106969-1ce29566ff1c',
    'photo-1555041469-a586c61ea9bc', 'photo-1538688525198-9b88f6f53126', 'photo-1503602642458-232111445657',
    'photo-1540518614846-7eded433c457', 'photo-1586023492125-27b2c045efd7', 'photo-1616486338812-3dadae4b4ace',
    'photo-1618220179428-22790b461013', 'photo-1615876234886-fd9a39fda97f', 'photo-1505693416388-ac5ce068fe85',
    'photo-1592078615290-033ee584e267', 'photo-1581428982868-e410dd047a90', 'photo-1551298370-9d3d53740c72',
    'photo-1544816155-12df9643f363', 'photo-1501183007986-d0d080b147f9', 'photo-1533090161767-e6ffed986c88',
    'photo-1594026112284-02bb6f3352fe', 'photo-1585412727339-54e4bae3bbf9'
  ],
  'books': [
    'photo-1544947950-fa07a98d237f', 'photo-1512820790803-83ca734da794', 'photo-1497633762265-9d179a990aa6',
    'photo-1589829545856-d10d557cf95f', 'photo-1516979187457-637abb4f9353', 'photo-1495640388908-05fa85288e61',
    'photo-1513001900722-370f803f498d', 'photo-1524995997946-a1c2e315a42f', 'photo-1532012197267-da84d127e765',
    'photo-1531988042231-d39a9cc12a9a', 'photo-1610116306796-6ebd7a489c0d', 'photo-1526244433582-3d97f89b986c',
    'photo-1543002588-bfa74002ed7e', 'photo-1506880018603-83d5b814b5a6', 'photo-1532012197267-da84d127e765',
    'photo-1512820790803-83ca734da794', 'photo-1476275466078-4007374efbbe', 'photo-1491841573378-b1322b20f188',
    'photo-1550399105-c4db5dd85c14', 'photo-1589829545856-d10d557cf95f'
  ],
  'toys': [
    'photo-1566576912321-d58edd7a2808', 'photo-1558060370-d644479cb6f7', 'photo-1596461404969-9ae70f2830c1',
    'photo-1587654780291-39c9404d746b', 'photo-1534447677768-be436bb09401', 'photo-1618843479313-40f8afb4b4d8',
    'photo-1615412727807-4c4099839401', 'photo-1603356029986-d13efee3a5cc', 'photo-1545558014-8692077e9b5c',
    'photo-1555448248-2571daf6344b', 'photo-1515488042361-404e9250afef', 'photo-1585155770447-3066d4a033be',
    'photo-1596461404969-9ae70f2830c1', 'photo-1515488042361-404e9250afef', 'photo-1534447677768-be436bb09401',
    'photo-1560942485-b2a11cc13456', 'photo-1500990721643-c6fc76891602', 'photo-1607604276583-eef5d076aa5f',
    'photo-1618843479313-40f8afb4b4d8', 'photo-1596461404969-9ae70f2830c1'
  ],
  'sports': [
    'photo-1517838277536-f5f99be501cd', 'photo-1518622358385-8ea7d0794bf6', 'photo-1571019613454-1cb2f99b2d8b',
    'photo-1584735935682-2f2b69dff9d2', 'photo-1605296867304-46d5465a25f1', 'photo-1599058917212-d750089bc07e',
    'photo-1574629810360-7efbbe195018', 'photo-1541534741688-6078c6bfb5c5', 'photo-1517649763962-0c623066013b',
    'photo-1601422407692-ec4eeec1d9b3', 'photo-1540497077202-7c8a3999166f', 'photo-1526506118085-60ce8714f8c5',
    'photo-1552674605-db6ffd4facb5', 'photo-1461896836934-ffe607ba8211', 'photo-1519766304817-4f37bda74a27',
    'photo-1476480862126-209bfaa8edc8', 'photo-1548690312-e3b507d8c110', 'photo-1502224562085-639556652f33',
    'photo-1517649763962-0c623066013b', 'photo-1574629810360-7efbbe195018'
  ],
  'accessories': [
    'photo-1509695507497-903c140c43b0', 'photo-1607604276583-eef5d076aa5f', 'photo-1553062407-98eeb64c6a62',
    'photo-1618424181497-157f25b6ddd5', 'photo-1522338242992-e1a54906a8da', 'photo-1583394838336-acd977736f90',
    'photo-1572635196237-14b3f281503f', 'photo-1542291026-7eec264c27ff', 'photo-1576906901871-d558a74da163',
    'photo-1590658268037-6bf12165a8df', 'photo-1603252109303-2751441dd157', 'photo-1600857062241-98e5dba7f214',
    'photo-1607604276583-eef5d076aa5f', 'photo-1522338242992-e1a54906a8da', 'photo-1618424181497-157f25b6ddd5',
    'photo-1542291026-7eec264c27ff', 'photo-1607604276583-eef5d076aa5f', 'photo-1572635196237-14b3f281503f',
    'photo-1590658268037-6bf12165a8df', 'photo-1603252109303-2751441dd157'
  ],
  'gaming': [
    'photo-1542751371-adc38448a05e', 'photo-1593642632823-8f785ba67e45', 'photo-1538481199705-c710c4e965fc',
    'photo-1612287230202-1bf1d85d1bdf', 'photo-1607604276583-eef5d076aa5f', 'photo-1550745165-9bc0b252726f',
    'photo-1552820728-8b83bb6b773f', 'photo-1615663245857-ac93bb7c39e7', 'photo-1580234810907-b40315b76418',
    'photo-1600861195091-690c92f1d2cc', 'photo-1627856013091-fed6e4e30025', 'photo-1614149162883-504ce4d13909',
    'photo-1604948501466-4e9c35249504', 'photo-1598550476439-6847785fce6e', 'photo-1612287230202-1bf1d85d1bdf',
    'photo-1592155931584-901ac15763e4', 'photo-1607604276583-eef5d076aa5f', 'photo-1550745165-9bc0b252726f',
    'photo-1538481199705-c710c4e965fc', 'photo-1542751371-adc38448a05e'
  ],
  'health': [
    'photo-1506126613408-eca07ce68773', 'photo-1544367567-0f2fcb009e0b', 'photo-1518495973542-4542c06a5843',
    'photo-1505571774588-f86f649f553e', 'photo-1532938911079-1b06ac7ceec7', 'photo-1506126613408-eca07ce68773',
    'photo-1544367567-0f2fcb009e0b', 'photo-1515377905703-c4788e51af15', 'photo-1505571774588-f86f649f553e',
    'photo-1584017911766-d451b3d0e843', 'photo-1612349317150-e413f6a5b16d', 'photo-1576091160550-2173dba999ef',
    'photo-1579684389782-64d84b5e6127', 'photo-1505751172876-fa1923c5c528', 'photo-1584308666744-24d5c474f2ae',
    'photo-1535914254981-b5012eebbd15', 'photo-1607613009820-a29f7bb81c04', 'photo-1550572017-edd951b55104',
    'photo-1622226873418-a274bc95c5ab', 'photo-1506126613408-eca07ce68773'
  ]
};

// programmatically generated title words
const titleWords = {
  'electronics': ['Smart Hub', 'Power Bank', 'Charger Dock', 'Earbuds Pro', 'Camera HD', 'Soundbar 2.1', 'AV Adapter', 'Bluetooth Dongle', 'Curved Monitor', 'Keypad RGB', 'Condenser Mic', 'VR Link', 'Splitter HDMI', 'Streaming Light', 'Cable Sleeve', 'Smart Bulb', 'Desk Pad', 'Felt Organizer', 'Audio DAC', 'Stand Base'],
  'mobiles': ['Quantum 5G', 'Active Shell', 'Tempered Glass', 'MagSafe Battery', 'Vent Qi Charger', 'Smart Tag Tracker', 'Ring Kickstand', 'Selfie Tripod', 'Braided USB-C', 'Dual Wall Plug', 'Flex TPU Case', 'Wireless Pad', 'Lens Protector', 'Phone Grip Strap', 'Dust Plugs', 'Adapter Dongle', 'Desk Stand Holder', 'Sports Armband', 'Waterproof Pouch', 'Gaming Clip Mount'],
  'laptops': ['Workstation Pro', 'Notebook Air', 'Chromebook Lite', 'Convertible 360', 'Liquid Rig Max', 'Linux Coder C1', 'Leather Sleeve', 'Thermal Gel Pad', 'Cooling Stand Fan', 'Privacy Screen Shield', 'USB-C Multi Hub', 'Power Brick PD', 'Cleaning Spray Kit', 'Keyboard Guard', 'Hard Shell Case', 'Webcam Shutter', 'Cable Ties Pack', 'Laptop Back Stand', 'Screen Microfiber', 'Dock Station Dual'],
  'fashion': ['Trench Wool Coat', 'Biker Leather Jacket', 'Oversized Knit Sweater', 'Active Windbreaker', 'Slim Fit Jeans', 'Mulberry Silk Shirt', 'Fleece Sweatpants', 'Stretch Formal Blazer', 'Linen Tie Sundress', 'Merino Thermal Top', 'Cargo Utility Shorts', 'Rainproof Poncho Shell', 'Classic Polo Tee', 'Chino Casual Pants', 'Knitted Midi Skirt', 'Denim Trucker Jacket', 'Crewneck Daily Tee', 'Lounge Fleece Hoodie', 'Linen Summer Shirt', 'Parka Fur Coat'],
  'shoes': ['Aero Running Sneakers', 'Vintage Derby Dress', 'Canvas Slip Loafers', 'High Top Hiking Boots', 'Court Indoor Trainers', 'Suede Chelsea Boots', 'Recovery Foam Slides', 'Combat Utility Boots', 'Sock Slip-On Sneakers', 'Carbon Plate Runner', 'Shearling Slippers', 'Woven Leather Stool', 'Minimalist Flat Pumps', 'Warm Winter Snow Boots', 'Leather Monk Strap', 'Breathable Mesh Gym', 'Vintage Oxford Brogue', 'Espadrille Summer Flats', 'Platform High Heels', 'Waterproof Trail Runner'],
  'watches': ['Chrono Analog Quartz', 'Automatic Steel Bezel', 'Smartwatch Active Fit', 'Minimalist Leather Strap', 'Dive Master Bezel', 'Pilot Vintage Aviator', 'Carbon Sport Dial', 'Slim Fitness Tracker', 'Rose Gold Steel Mesh', 'Skeleton Mechanical dial', 'SolarDrive Eco Power', 'Tactical Military Analog', 'Titanium Luxury Quartz', 'Smart Band Sport V2', 'Hybrid Classic Watch', 'Minimal Sandstone Dial', 'Luminous Hands Aviator', 'Retro Digital Steel', 'Leather Chronograph Gold', 'Ceramic Minimalist Quartz'],
  'beauty': ['Hyaluronic Hydrate Serum', 'Retinol Night Cream', 'Argan Hair Oil Spray', 'Mineral SPF 50 Shield', 'pH Balanced Cleanser', 'Coffee Body Polish', 'Vitamin C Bright Glow', 'French Pink Clay Mask', 'Coconut Lip Butter', 'Tea Tree Acne Gel', 'Rosewater Toning Mist', 'Niacinamide Pore Refiner', 'Jojoba Cuticle oil', 'Bamboo Makeup Pads', 'Aloe Vera Calming Gel', 'Shea Body Butter cream', 'Charcoal Detox Scrub', 'Peppermint Lip Scrub', 'Marula Facial Oil', 'Botanical Hand Cream'],
  'grocery': ['EV Olive Oil 750ml', 'Whole Arabica Coffee', 'Raw Wildflower Honey', 'Gourmet Vanilla Pods', 'Himalayan Coarse Salt', 'Ceremonial Matcha 50g', 'Maple Syrup Grade A', 'Gourmet Peppercorn Mix', 'Tri-Color Quinoa Grains', 'Cold-Pressed Coconut Oil', 'Turmeric Curcumin Powder', 'Organic Chia Seeds', 'Raw Apple Cider Vinegar', 'Natural Almond Butter', 'Ground Ceylon Cinnamon', 'Gluten Free Oat Flour', 'Whole Dried Oregano', 'Pure Royal Jelly Jar', 'Himalayan Pink Fine Salt', 'Organic Coconut Sugar'],
  'home-kitchen': ['Ceramic Frying Pan', 'Ambient Column Floor Lamp', 'Ceramic Salad Plates', 'Waffle Knit Blanket', 'Chef Knife Block Set', 'Gooseneck Electric Kettle', 'Glass Oak Drink Carafe', 'Smart WiFi RGB Bulb', 'Linen Semi Sheer Curtains', 'Ultrasonic Mist Diffuser', 'Bamboo Cutting Boards', 'Matte Finish Coffee Mug', 'Silicone Baking Mats', 'Stainless Steel Straws', 'Magnetic Knife Holder', 'Linen Table Runner', 'Woven Seagrass Baskets', 'Ceramic Herb Planter', 'Matte Tea Storage Tin', 'Felt Coasters Pack'],
  'furniture': ['Linen Accent Armchair', 'Nesting Coffee Tables', 'Velvet Dining Chairs', 'Tufted Velvet Futon', 'Walnut Tier Bookshelf', 'Oak Writing Study Desk', 'Marble Top Side Table', 'Slatted TV Media Stand', 'Fabric Tufted Headboard', 'Ergonomic Mesh Swivel', 'Woven Leather Stool Set', 'Walnut Nightstand Chest', 'Industrial Pipe Shelves', 'Round Ottoman Pouf', 'Minimal Console Table', 'Faux Leather Bean Bag', 'Oak Coat Hanger Stand', 'Mid-century Sofa Bed', 'Slatted Bed Frame King', 'Swivel Counter Bar Stools'],
  'books': ['Horizon Saga Novel', 'Scandic Design Journal', 'Algorithm Coder Manual', 'Mindful Breathing Guide', 'Gourmet Vegan Cookbook', 'Machine Learning Master', 'Renaissance Art History', 'Pacific Mystery Novel', 'Decoupled Software Guide', 'Star Clusters Nebula Map', 'Classic Patisserie Guide', 'Clean Code Architecture', 'Responsive Design Principles', 'Design Patterns GoF', 'Modern JavaScript Handbook', 'Node.js Backend Blueprint', 'Database Normalization PDF', 'Full Stack Project Plan', 'Git Command Line Guide', 'Microservices Scaling Book'],
  'toys': ['Wooden Block Set 100pc', 'Cotton Teddy Bear Doll', 'RC Racing Speed Car', 'Wooden Rainbow Stacker', 'Weighted Sleep Koala', 'Solar Wood Airplane Kit', 'Magnetic Folding Board', 'Knit Bunny baby Rattle', 'Toddler Balance Bike', 'Sandbox Castle Kit Set', 'Projection Toy Watch', 'Magnetic Dart Board Game', 'DIY Solar Windmill wood', 'Soft Plush Dino Pillow', 'Wooden Geometry Puzzles', 'Bio-Plastic Spade Bucket', 'Animal Wooden Train Toy', 'Plush Sleepy Fox doll', 'Magnetic Alphabet Tiles', 'Toddler Stacking Ring Set'],
  'sports': ['Adjustable Dumbbell Set', 'TPE Eco Yoga Mat 6mm', 'Insulated Straw Bottle', 'Heavy Resistance Bands', 'Cast Iron Black Kettlebell', 'Speed Jump Rope Pro', 'Muscle Foam Roller Grid', 'Door Frame Pullup Bar', 'Smart HR Fitness Band', 'Anti-Burst Yoga Core Ball', 'Neoprene Dumbbells Pair', 'Ankle Wrist Strap Weights', 'Deep Tissue Massage Gun', 'Nylon Gym Duffel Bag', 'Waterproof Sport Watch', 'Yoga Foam Block Pair', 'Non-Slip Core Exercise Mat', 'Resistance Loop Bands Set', 'Aluminum Gym Bottle Lite', 'Adjustable Weight Bench Pro'],
  'accessories': ['Canvas Laptop Backpack', 'RFID Slim Leather Wallet', 'Nylon Shoe Compartment Bag', 'Cashmere Knit Scarf', 'Polarized Sunglasses UV', 'Desk felt Pad Table protector', 'Cowhide Brass Belt', 'Acrylic Running Beanie', 'Canvas Sun Beach Hat', 'Silicone Organizer Key clip', 'Privacy Shield Luggage Tag', 'Canvas Tote Shoulder Bag', 'Leather Key Fob Loop', 'Polarized Aviator Glasses', 'Knit Cable Winter Gloves', 'Canvas Travel Duffel Bag', 'RFID Passport Cover Case', 'Leather Card Holder Pocket', 'Wool Fedora Classic Hat', 'Elastic Travel Luggage Cover'],
  'gaming': ['Mechanical Gaming Keyboard', 'Optical Precision Wired Mouse', 'Immersive Surround Headset', 'RGB Charging Headphone Stand', 'Comfort Controller Grip Cases', 'Condenser Cardioid USB Mic', 'VR Standalone Headset Grip', 'HD Stream Capture Card', 'Pro Gaming Chair Pillow', 'Tangle-Free Mouse Bungee', 'PBT Double-Shot Keycaps', 'Memory Foam Wrist Rest', 'Controller Thumb Grips Set', 'Nylon Braided Coiled Cable', 'Flight Arcade Joystick USB', 'Force Feedback Steering Wheel', 'Bluetooth Gaming Soundbar', 'RGB LED Desk Lightbar', 'Anti-Fray Extended Desk Mat', '4K HDMI Matrix Switcher'],
  'health': ['True HEPA Air Purifier', 'Smart Body Fat Scale', 'White Noise Sound Machine', 'Percussion Target Massage Gun', 'Smart Wrist BP Monitor', 'Reusable Gel Ice Wrap', 'Ultrasonic Cool Mist Humidifier', 'Trigger Point Therapy Roller', 'Wireless TENS Unit Pulse', 'FDA Finger Pulse Oximeter', 'Organic Lavender Sleep Pillow', 'Smart Meds Pill Organizer', 'Therapeutic Foot Massage Roller', 'Aromatherapy Bath Salt Blend', 'Blue Light Blocking Glasses', 'Postures Corrector Back Support', 'Electric Heating Compress Pad', 'Noise Cancelling Sleep Earplugs', 'Essential oils Inhaler sticks', 'Anti-fatigue Standing Desk Mat']
};

const brandsPool = {
  'electronics': 'Acoustic Labs',
  'mobiles': 'AeroCharge',
  'laptops': 'Apex',
  'fashion': 'VogueWear',
  'shoes': 'AeroStride',
  'watches': 'Vanguard',
  'beauty': 'GlowSkin',
  'grocery': 'NapaGrown',
  'home-kitchen': 'ChefPro',
  'furniture': 'NorseDesign',
  'books': 'ChroniclePress',
  'toys': 'Plushies',
  'sports': 'IronGrip',
  'accessories': 'UrbanStride',
  'gaming': 'KeyForge',
  'health': 'TheraLife'
};

const baseDescriptions = {
  'electronics': 'Engineered to provide professional quality, durability, and high-fidelity responses in home and studio layouts.',
  'mobiles': 'Top tier portable device featuring high battery endurance, fast charge protocols, and impact drop shield bumpers.',
  'laptops': 'Built for high performance software development, graphics compiling, daily multi-tasking, and travel workloads.',
  'fashion': 'Tailored using premium organic fabrics and double stitched seams, providing style comfort across seasons.',
  'shoes': 'Features custom responsive air cushion midsoles and high grip slip protection treads for physical activities.',
  'watches': 'Manufactured using surgical grade steel, sapphire glass, and Japanese movements for precision tracking.',
  'beauty': 'Infused with organic botanical extracts and antioxidants to rejuvenate skin and restore natural moisture barriers.',
  'grocery': 'Sourced directly from organic certified farms and family cooperatives, processed naturally without additives.',
  'home-kitchen': 'Ergonomically designed cookware and accessories crafted from eco-friendly premium materials for gourmet preps.',
  'furniture': 'Crafted with premium solid hardwoods and upholstered in durable fabrics, bringing Scandinavian aesthetics to any space.',
  'books': 'An essential reference guide and masterpiece loaded with expert illustrations, guides, and descriptive diagrams.',
  'toys': 'Designed using non-toxic child-safe materials, focusing on cognitive learning, motor skills, and sensory fun.',
  'sports': 'Built from heavy-gauge industrial materials, providing durable training utility for core and muscle workouts.',
  'accessories': 'Handcrafted utility setups designed to organize, carry, and safeguard your everyday essential items.',
  'gaming': 'Features high response rates, custom RGB integration, and ergonomic controls to boost competitive streaming matches.',
  'health': 'Clinically tested therapeutic devices designed to clean air, monitor vitals, and accelerate muscle recovery.'
};

const createMockReviews = (userIds) => [
  { user: userIds[1], name: 'John Doe', rating: 5, comment: 'Exceptional build quality. Exceeded expectations!' },
  { user: userIds[0], name: 'Admin Reviewer', rating: 4, comment: 'Highly recommended for premium standard buyers.' }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
    console.log(`Seeder connected to MongoDB: ${conn.connection.host}`);

    // Clear old tables
    console.log('Purging old collections records...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();

    // 1. Seed Users
    console.log('Seeding user profiles...');
    const createdUsers = await User.create(usersData);
    const adminUser = createdUsers[0];
    const customerUser = createdUsers[1];
    const userIds = [adminUser._id, customerUser._id];

    // 2. Seed Categories
    console.log('Seeding category lists...');
    const seededCategories = await Category.create(categoriesData);
    
    // Map category slug to its ID
    const catMap = {};
    seededCategories.forEach(c => {
      catMap[c.slug] = c._id;
    });

    // 3. Compile and Seed 320 Products (20 products per category * 16 categories)
    console.log('Generating 320 completely unique products...');
    const productsData = [];

    Object.keys(titleWords).forEach((slug) => {
      const catId = catMap[slug];
      if (!catId) return;

      const titles = titleWords[slug];
      const photoIds = unsplashPhotoPool[slug];
      const brand = brandsPool[slug] || 'Generic';
      const baseDesc = baseDescriptions[slug] || 'High quality professional product.';

      titles.forEach((title, index) => {
        // Compute base original price and discounts
        // Base original price ranges from $15 to $1500 depending on category and index
        let baseOriginalPrice = 20.00;
        if (slug === 'electronics' || slug === 'gaming') baseOriginalPrice = 80.00 + (index * 25);
        else if (slug === 'mobiles') baseOriginalPrice = 120.00 + (index * 45);
        else if (slug === 'laptops') baseOriginalPrice = 499.00 + (index * 100);
        else if (slug === 'furniture') baseOriginalPrice = 150.00 + (index * 30);
        else if (slug === 'watches') baseOriginalPrice = 90.00 + (index * 20);
        else if (slug === 'shoes') baseOriginalPrice = 60.00 + (index * 10);
        else if (slug === 'books') baseOriginalPrice = 15.00 + (index * 2.5);
        else if (slug === 'grocery') baseOriginalPrice = 8.00 + (index * 1.5);
        else baseOriginalPrice = 25.00 + (index * 5);

        // Limit decimal values
        baseOriginalPrice = Math.round(baseOriginalPrice * 100) / 100;
        
        // Discount percentages range from 10% to 50%
        const discountPercentage = 10 + (index % 5) * 10;
        
        // Mathematically correct sales price
        const price = Math.round(baseOriginalPrice * (1 - discountPercentage / 100) * 100) / 100;

        // Photo settings
        const photoId = photoIds[index] || 'photo-1505740420928-5e560c06d30e';
        const mainImage = `https://images.unsplash.com/${photoId}?w=600&auto=format&fit=crop&q=80`;
        
        // Gallery of 3 photos
        const galleryIds = [
          photoId,
          photoIds[(index + 1) % photoIds.length],
          photoIds[(index + 2) % photoIds.length]
        ];
        const imagesGallery = galleryIds.map(gid => `https://images.unsplash.com/${gid}?w=600&auto=format&fit=crop&q=80`);

        // Compute rating parameters
        const rating = Math.round((4.0 + (index % 10) * 0.1) * 10) / 10;
        const numReviews = 4 + (index * 3);

        // Unique slug to prevent routing conflicts
        const cleanSlug = title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 6);

        productsData.push({
          title: `${brand} ${title}`,
          slug: cleanSlug,
          description: `${title}. ${baseDesc} Crafted for premium quality and long-lasting durability.`,
          price: price,
          originalPrice: baseOriginalPrice,
          discountPercentage: discountPercentage,
          category: catId,
          brand: brand,
          stock: 5 + (index * 3), // Varied stocks (some low for alerts)
          images: imagesGallery,
          rating: rating,
          numReviews: numReviews,
          isFeatured: index === 0 || index === 8 || index === 15,
          isTrending: index === 1 || index === 11 || index === 18,
          isNewArrival: index === 2 || index === 7 || index === 19,
          reviews: createMockReviews(userIds)
        });
      });
    });

    await Product.create(productsData);
    console.log(`Seeded exactly ${productsData.length} unique products successfully!`);

    // 4. Seed Coupons
    console.log('Seeding coupons...');
    await Coupon.create(couponsData);

    console.log('\n=============================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!    ');
    console.log('---------------------------------------------');
    console.log('Default Admin Account:');
    console.log('  Email:    admin@example.com');
    console.log('  Password: password123');
    console.log('---------------------------------------------');
    console.log('Default Customer Account:');
    console.log('  Email:    john@example.com');
    console.log('  Password: password123');
    console.log('=============================================\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error during database seeding: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
