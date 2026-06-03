/* Word Finder - Game Logic */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const clueVisual = document.getElementById('clue-visual');
  const clueText = document.getElementById('clue-text');
  const slotsContainer = document.getElementById('slots-container');
  const lettersGrid = document.getElementById('letters-grid');
  
  const wordIndexEl = document.getElementById('word-index');
  const levelValEl = document.getElementById('level-val');
  
  // Overlays
  const overlayPause = document.getElementById('overlay-pause');
  const overlayGameOver = document.getElementById('overlay-gameover');
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverDesc = document.getElementById('gameover-desc');
  const finalScoreEl = document.getElementById('final-score');
  const bestScoreEl = document.getElementById('best-score');
  
  // Controls
  const btnPause = document.getElementById('btn-pause');
  const btnRestart = document.getElementById('btn-restart');
  const btnClear = document.getElementById('btn-clear');
  const btnResume = document.getElementById('btn-resume');
  const btnRetry = document.getElementById('btn-retry');

  // Word master list (300 words with custom visuals and clues)
  const wordMaster = [
    { word: 'CAT', visual: '🐱', text: 'A small furry domestic companion that meows.' },
    { word: 'DOG', visual: '🐶', text: 'A loyal four-legged canine pet.' },
    { word: 'SUN', visual: '☀️', text: 'The star at the center of our solar system.' },
    { word: 'BUS', visual: '🚌', text: 'A large motor vehicle carrying passengers.' },
    { word: 'BOAT', visual: '⛵', text: 'A small vessel used for water travel.' },
    { word: 'TREE', visual: '🌳', text: 'A tall woody perennial plant with leaves.' },
    { word: 'FISH', visual: '🐟', text: 'A limbless cold-blooded gill-breathing water animal.' },
    { word: 'FROG', visual: '🐸', text: 'A tailless amphibian with strong leaping legs.' },
    { word: 'CAKE', visual: '🍰', text: 'A sweet baked dessert item.' },
    { word: 'BIRD', visual: '🐦', text: 'A feathered winged warm-blooded egg-laying creature.' },
    { word: 'APPLE', visual: '🍎', text: 'A sweet red/green crunchy fruit.' },
    { word: 'GRAPE', visual: '🍇', text: 'A small round smooth-skinned juicy fruit.' },
    { word: 'SHARK', visual: '🦈', text: 'A large predatory fish with sharp teeth.' },
    { word: 'PLANE', visual: '✈️', text: 'A powered flying vehicle with fixed wings.' },
    { word: 'CLOCK', visual: '⏰', text: 'A device used to measure and show time.' },
    { word: 'ROCKET', visual: '🚀', text: 'A spacecraft propelled by rocket engines.' },
    { word: 'CHEESE', visual: '🧀', text: 'A dairy product made from milk curds.' },
    { word: 'CASTLE', visual: '🏰', text: 'A large fortified building with towers.' },
    { word: 'ROBOT', visual: '🤖', text: 'A machine capable of carrying out complex actions.' },
    { word: 'WIZARD', visual: '🧙', text: 'A man who has magical powers in folklore.' },
    { word: 'OCTOPUS', visual: '🐙', text: 'A soft-bodied, eight-armed sea mollusk.' },
    { word: 'RAINBOW', visual: '🌈', text: 'A colorful meteorological arc in the sky.' },
    { word: 'BALLOON', visual: '🎈', text: 'A flexible bag filled with helium or hot air.' },
    { word: 'BICYCLE', visual: '🚲', text: 'A vehicle with two wheels propelled by pedals.' },
    { word: 'LANTERN', visual: '🏮', text: 'A portable protective case for a light source.' },
    { word: 'UNICORN', visual: '🦄', text: 'A mythical horse-like creature with a single horn.' },
    { word: 'COMPUTER', visual: '💻', text: 'An electronic device for storing and processing data.' },
    { word: 'TELESCOPE', visual: '🔭', text: 'An optical instrument for viewing distant objects.' },
    { word: 'DINO', visual: '🦖', text: 'A colloquial name for prehistoric dinosaurs.' },
    { word: 'MONSTER', visual: '👾', text: 'A strange or terrifying imaginary creature.' },
    { word: 'MOON', visual: '🌙', text: 'The natural satellite that orbits the earth.' },
    { word: 'STAR', visual: '⭐', text: 'A luminous point in the night sky.' },
    { word: 'CLOUD', visual: '☁️', text: 'A visible mass of condensed water vapor.' },
    { word: 'RAIN', visual: '🌧️', text: 'Water falling in drops from vapor in the atmosphere.' },
    { word: 'WIND', visual: '💨', text: 'The perceptible natural movement of the air.' },
    { word: 'FIRE', visual: '🔥', text: 'Combustion or burning, producing light and heat.' },
    { word: 'ICE', visual: '❄️', text: 'Frozen water, a brittle transparent crystalline solid.' },
    { word: 'ROCK', visual: '🪨', text: 'The solid mineral material forming part of the earth.' },
    { word: 'LEAF', visual: '🍃', text: 'A flattened green structure of a plant.' },
    { word: 'ROSE', visual: '🌹', text: 'A prickly bush that typically bears fragrant flowers.' },
    { word: 'PALM', visual: '🌴', text: 'An unbranched evergreen tree with long leaves.' },
    { word: 'PEACH', visual: '🍑', text: 'A round stone fruit with juicy yellow flesh.' },
    { word: 'MELON', visual: '🍈', text: 'A large round fruit with sweet pulpy flesh.' },
    { word: 'LEMON', visual: '🍋', text: 'A yellow oval citrus fruit with fragrant, acid juice.' },
    { word: 'BANANA', visual: '🍌', text: 'A long curved fruit which grows in clusters.' },
    { word: 'CHERRY', visual: '🍒', text: 'A small, round stone fruit that is typically bright red.' },
    { word: 'HONEY', visual: '🍯', text: 'A sweet, sticky yellowish-brown fluid made by bees.' },
    { word: 'BREAD', visual: '🍞', text: 'Food made of flour, water, and yeast mixed and baked.' },
    { word: 'PIZZA', visual: '🍕', text: 'A flat, round baked base of dough with toppings.' },
    { word: 'COOKIE', visual: '🍪', text: 'A sweet baked biscuit, typically containing chocolate chips.' },
    { word: 'MILK', visual: '🥛', text: 'An opaque white fluid rich in fat and protein.' },
    { word: 'COFFEE', visual: '☕', text: 'A hot drink made from the roasted seeds of a tropical shrub.' },
    { word: 'LION', visual: '🦁', text: 'A large tawny-coloured cat that lives in prides.' },
    { word: 'TIGER', visual: '🐯', text: 'A very large solitary cat with striped yellow-brown coat.' },
    { word: 'BEAR', visual: '🐻', text: 'A large, heavy mammal with thick fur.' },
    { word: 'PANDA', visual: '🐼', text: 'A large bearlike mammal with black and white markings.' },
    { word: 'KOALA', visual: '🐨', text: 'A bear-like arboreal Australian marsupial.' },
    { word: 'MONKEY', visual: '🐵', text: 'A small mischievous primate with a long tail.' },
    { word: 'RABBIT', visual: '🐰', text: 'A plant-eating mammal with long ears.' },
    { word: 'MOUSE', visual: '🐭', text: 'A tiny rodent with a pointed snout and long tail.' },
    { word: 'HORSE', visual: '🐴', text: 'A large hoofed mammal with a flowing mane and tail.' },
    { word: 'SHEEP', visual: '🐑', text: 'A domesticated ruminant mammal with a thick woolly coat.' },
    { word: 'COW', visual: '🐮', text: 'A fully grown female domestic animal kept for milk.' },
    { word: 'PIG', visual: '🐷', text: 'A domestic animal with a broad snout and fat body.' },
    { word: 'CHICK', visual: '🐥', text: 'A young bird, especially a newly hatched chicken.' },
    { word: 'OWL', visual: '🦉', text: 'A nocturnal bird of prey with large forward-facing eyes.' },
    { word: 'SNAKE', visual: '🐍', text: 'A long limbless reptile which has no eyelids.' },
    { word: 'SPIDER', visual: '🕷️', text: 'An eight-legged arachnid that spins webs.' },
    { word: 'BEE', visual: '🐝', text: 'A stinging winged insect which collects nectar.' },
    { word: 'CRAB', visual: '🦀', text: 'A marine crustacean with a broad carapace and claws.' },
    { word: 'TURTLE', visual: '🐢', text: 'A slow-moving reptile enclosed in a protective shell.' },
    { word: 'DOLPHIN', visual: '🐬', text: 'A small gregarious toothed whale, known for intelligence.' },
    { word: 'WHALE', visual: '🐳', text: 'A very large marine mammal with a blowhole.' },
    { word: 'CAMERA', visual: '📷', text: 'A device for recording visual images.' },
    { word: 'PHONE', visual: '📱', text: 'A portable telephone that can run apps.' },
    { word: 'GUITAR', visual: '🎸', text: 'A stringed musical instrument with six strings.' },
    { word: 'VIOLIN', visual: '🎻', text: 'A stringed musical instrument played with a bow.' },
    { word: 'DRUM', visual: '🥁', text: 'A percussion instrument sounded by being struck.' },
    { word: 'BOOK', visual: '📖', text: 'A written or printed work consisting of pages.' },
    { word: 'CROWN', visual: '👑', text: 'A circular ornamental headdress worn by a monarch.' },
    { word: 'RING', visual: '💍', text: 'A small circular band worn on a finger.' },
    { word: 'HOUSE', visual: '🏠', text: 'A building for human habitation.' },
    { word: 'TENT', visual: '⛺', text: 'A portable shelter made of cloth.' },
    { word: 'CAR', visual: '🚗', text: 'A road vehicle, typically with four wheels.' },
    { word: 'TRUCK', visual: '🚚', text: 'A large, heavy motor vehicle for transporting goods.' },
    { word: 'TRAIN', visual: '🚆', text: 'A series of connected railway carriages.' },
    { word: 'HELICOPTER', visual: '🚁', text: 'A type of aircraft deriving lift from rotors.' },
    { word: 'BALL', visual: '⚽', text: 'A spherical object used in various sports.' },
    { word: 'TROPHY', visual: '🏆', text: 'A cup awarded as a prize for victory.' },
    { word: 'SHIELD', visual: '🛡️', text: 'A broad piece of armor carried on the arm.' },
    { word: 'SWORD', visual: '⚔️', text: 'A weapon with a long metal blade.' },
    { word: 'KEY', visual: '🔑', text: 'A small piece of metal used to open a lock.' },
    { word: 'BELL', visual: '🔔', text: 'A hollow metal object that rings.' },
    { word: 'GIFT', visual: '🎁', text: 'A thing given willingly to someone.' },
    { word: 'HAMMER', visual: '🔨', text: 'A tool with a heavy metal head on a handle.' },
    { word: 'ANCHOR', visual: '⚓', text: 'A heavy object used to moor a ship.' },
    { word: 'GLOBE', visual: '🌐', text: 'A spherical representation of the earth.' },
    { word: 'FLAG', visual: '🚩', text: 'A piece of cloth with a distinctive design.' },
    { word: 'HEART', visual: '❤️', text: 'A hollow muscular organ that pumps blood.' },
    { word: 'DIAMOND', visual: '💎', text: 'A precious stone of crystalline pure carbon.' },
    { word: 'SCISSORS', visual: '✂️', text: 'A hand-held cutting tool with two pivoting blades.' },
    { word: 'BRUSH', visual: '🖌️', text: 'An implement with bristles, used for painting.' },
    { word: 'PENCIL', visual: '✏️', text: 'An instrument for writing, made of graphite.' },
    { word: 'CRAYON', visual: '🖍️', text: 'A stick of colored wax, used for drawing.' },
    { word: 'RULER', visual: '📏', text: 'A straight strip of wood or plastic, used to measure.' },
    { word: 'LOCK', visual: '🔒', text: 'A mechanism for keeping a door fastened.' },
    { word: 'MAGNET', visual: '🧲', text: 'A piece of metal that attracts other metals.' },
    { word: 'MIRROR', visual: '🪞', text: 'A reflective glass surface.' },
    { word: 'SOAP', visual: '🧼', text: 'A substance used with water for washing.' },
    { word: 'SPONGE', visual: '🧽', text: 'A piece of light, absorbent material.' },
    { word: 'SHIRT', visual: '👕', text: 'A garment for the upper part of the body.' },
    { word: 'JEANS', visual: '👖', text: 'Hard-wearing trousers made of denim.' },
    { word: 'SHOE', visual: '👟', text: 'A covering for the foot.' },
    { word: 'HAT', visual: '🎩', text: 'A shaped covering for the head.' },
    { word: 'GLOVES', visual: '🧤', text: 'Hand coverings with separate finger sheaths.' },
    { word: 'WATCH', visual: '⌚', text: 'A small timepiece worn on the wrist.' },
    { word: 'BAG', visual: '👜', text: 'A container with an opening, used for carrying.' },
    { word: 'BOTTLE', visual: '🍼', text: 'A plastic or glass container for storing drinks.' },
    { word: 'FORK', visual: '🍴', text: 'An eating utensil with two or more prongs.' },
    { word: 'SPOON', visual: '🥄', text: 'An eating utensil with a small, shallow bowl.' },
    { word: 'CHOPSTICKS', visual: '🥢', text: 'A pair of thin sticks used as eating utensils.' },
    { word: 'CUP', visual: '🥛', text: 'A small bowl-shaped container for drinking.' },
    { word: 'TEAPOT', visual: '🫖', text: 'A pot in which tea is made.' },
    { word: 'JAR', visual: '🫙', text: 'A wide-mouthed glass container.' },
    { word: 'LAMP', visual: '💡', text: 'A device for giving light.' },
    { word: 'CHAIR', visual: '🪑', text: 'A separate seat for one person.' },
    { word: 'BED', visual: '🛏️', text: 'A piece of furniture for sleep.' },
    { word: 'DOOR', visual: '🚪', text: 'A barrier at the entrance to a room.' },
    { word: 'WINDOW', visual: '🪟', text: 'An opening in a wall, fitted with glass.' },
    { word: 'BROOM', visual: '🧹', text: 'A long-handled brush used for sweeping.' },
    { word: 'TOWEL', visual: '🧻', text: 'An absorbent paper or cloth used for drying.' },
    { word: 'BOX', visual: '📦', text: 'A rectangular container.' },
    { word: 'ENVELOPE', visual: '✉️', text: 'A flat paper container for letters.' },
    { word: 'PAPER', visual: '📄', text: 'Thin sheets made from the pulp of wood.' },
    { word: 'CLIP', visual: '📎', text: 'A device for holding sheets of paper together.' },
    { word: 'MAP', visual: '🗺️', text: 'A visual representation of geographical areas.' },
    { word: 'COIN', visual: '🪙', text: 'A flat, round official piece of metal.' },
    { word: 'TICKET', visual: '🎫', text: 'A paper giving the holder admission.' },
    { word: 'MEDAL', visual: '🏅', text: 'A metal disc awarded as an honor.' },
    { word: 'FLASHLIGHT', visual: '🔦', text: 'A battery-operated portable light source.' },
    { word: 'BATTERY', visual: '🔋', text: 'A container carrying electrical charge.' },
    { word: 'LADDER', visual: '🪜', text: 'A structure of steps used for climbing.' },
    { word: 'BASKET', visual: '🧺', text: 'A container made of interwoven wood strips.' },
    { word: 'SOCCER', visual: '⚽', text: 'A sport played on a field with a round ball.' },
    { word: 'BASKETBALL', visual: '🏀', text: 'A sport played on a court with a hoop.' },
    { word: 'BASEBALL', visual: '⚾', text: 'A bat-and-ball game played with bases.' },
    { word: 'TENNIS', visual: '🎾', text: 'A game where players hit a ball with rackets.' },
    { word: 'VOLLEYBALL', visual: '🏐', text: 'A team sport hit over a high net.' },
    { word: 'PUZZLE', visual: '🧩', text: 'A game designed to test ingenuity.' },
    { word: 'KITE', visual: '🪁', text: 'A light frame flown in the wind.' },
    // --- 150 Additional Unique Words ---
    { word: 'EAGLE', visual: '🦅', text: 'A large, powerful bird of prey with keen vision.' },
    { word: 'DUCK', visual: '🦆', text: 'A waterbird with webbed feet and a broad flat bill.' },
    { word: 'PENGUIN', visual: '🐧', text: 'A flightless bird of southern seas, walking upright.' },
    { word: 'CHICKEN', visual: '🐔', text: 'A domestic fowl kept for eggs or meat.' },
    { word: 'TURKEY', visual: '🦃', text: 'A large mainly domesticated game bird.' },
    { word: 'FLAMINGO', visual: '🦩', text: 'A tall wading bird with pink plumage and long legs.' },
    { word: 'PEACOCK', visual: '🦚', text: 'A large male bird with a brilliant tail of feathers.' },
    { word: 'PARROT', visual: '🦜', text: 'A brightly colored bird known for mimicking speech.' },
    { word: 'SWAN', visual: '🦢', text: 'A large, elegant white waterbird with a long neck.' },
    { word: 'FOX', visual: '🦊', text: 'A clever carnivorous mammal with a bushy tail.' },
    { word: 'WOLF', visual: '🐺', text: 'A wild carnivorous canine that hunts in packs.' },
    { word: 'DEER', visual: '🦌', text: 'A hoofed grazing animal, males having antlers.' },
    { word: 'BAT', visual: '🦇', text: 'A nocturnal flying mammal with leathery wings.' },
    { word: 'SQUIRREL', visual: '🐿️', text: 'A bushy-tailed rodent that feeds on nuts.' },
    { word: 'HEDGEHOG', visual: '🦔', text: 'A small insect-eating mammal covered in spines.' },
    { word: 'LIZARD', visual: '🦎', text: 'A reptile with a scaly body and a long tail.' },
    { word: 'BUTTERFLY', visual: '🦋', text: 'An insect with broad, colorful wings.' },
    { word: 'LADYBUG', visual: '🐞', text: 'A small round beetle, usually red with black spots.' },
    { word: 'CATERPILLAR', visual: '🐛', text: 'The worm-like larva of a butterfly or moth.' },
    { word: 'ANT', visual: '🐜', text: 'A small social insect known for working in colonies.' },
    { word: 'SNAIL', visual: '🐌', text: 'A slow-moving mollusk with a spiral shell.' },
    { word: 'MOSQUITO', visual: '🦟', text: 'A slender biting fly that sucks blood.' },
    { word: 'LOBSTER', visual: '🦞', text: 'A large marine crustacean with large pincers.' },
    { word: 'SQUID', visual: '🦑', text: 'A ten-armed sea mollusk with an elongated body.' },
    { word: 'SEAL', visual: '🦭', text: 'A fish-eating sea mammal with flippers.' },
    { word: 'OTTER', visual: '🦦', text: 'A playful semi-aquatic mammal with thick fur.' },
    { word: 'BEAVER', visual: '🦫', text: 'A semi-aquatic rodent that builds dams.' },
    { word: 'BADGER', visual: '🦡', text: 'A burrowing carnivorous mammal with striped head.' },
    { word: 'AVOCADO', visual: '🥑', text: 'A pear-shaped fruit with green skin and a large pit.' },
    { word: 'BROCCOLI', visual: '🥦', text: 'A green vegetable with edible flower heads.' },
    { word: 'CARROT', visual: '🥕', text: 'An orange root vegetable, sweet and crunchy.' },
    { word: 'CORN', visual: '🌽', text: 'A tall cereal grass bearing yellow kernels.' },
    { word: 'COCONUT', visual: '🥥', text: 'A large seed of a palm tree with white flesh.' },
    { word: 'PINEAPPLE', visual: '🍍', text: 'A large tropical fruit with a spiky skin.' },
    { word: 'STRAWBERRY', visual: '🍓', text: 'A sweet red juicy fruit speckled with seeds.' },
    { word: 'WATERMELON', visual: '🍉', text: 'A very large fruit with sweet red pulp and seeds.' },
    { word: 'KIWI', visual: '🥝', text: 'A small brown fuzzy fruit with green flesh.' },
    { word: 'MANGO', visual: '🥭', text: 'A tropical stone fruit with sweet orange flesh.' },
    { word: 'PEAR', visual: '🍐', text: 'A sweet, bell-shaped fruit with yellow/green skin.' },
    { word: 'TOMATO', visual: '🍅', text: 'A glossy red pulpy fruit used as a vegetable.' },
    { word: 'POTATO', visual: '🥔', text: 'A starchy plant tuber used widely in cooking.' },
    { word: 'ONION', visual: '🧅', text: 'A bulbous vegetable with a pungent taste and layers.' },
    { word: 'GARLIC', visual: '🧄', text: 'A strong-smelling bulb used as a seasoning.' },
    { word: 'PEPPER', visual: '🫑', text: 'A hollow green or red vegetable used in salads.' },
    { word: 'EGGPLANT', visual: '🍆', text: 'A large purple vegetable with white flesh.' },
    { word: 'MUSHROOM', visual: '🍄', text: 'A fungal growth consisting of a domed cap.' },
    { word: 'TORTILLA', visual: '🫓', text: 'A thin, flat pancake-like corn or wheat bread.' },
    { word: 'BURRITO', visual: '🌯', text: 'A Mexican dish of a rolled tortilla with filling.' },
    { word: 'TACO', visual: '🌮', text: 'A folded tortilla filled with meat and cheese.' },
    { word: 'SUSHI', visual: '🍣', text: 'A Japanese dish of cold vinegared rice and raw fish.' },
    { word: 'DONUT', visual: '🍩', text: 'A small fried cake of sweetened dough, ring-shaped.' },
    { word: 'POPCORN', visual: '🍿', text: 'Corn kernels heated until they puff up.' },
    { word: 'BUTTER', visual: '🧈', text: 'A pale yellow fatty substance made from milk.' },
    { word: 'EGG', visual: '🥚', text: 'An oval body laid by birds, eaten as food.' },
    { word: 'WAFFLE', visual: '🧇', text: 'A crisp batter cake baked in a patterned iron.' },
    { word: 'PANCAKE', visual: '🥞', text: 'A thin, flat cake of batter fried in a pan.' },
    { word: 'PRETZEL', visual: '🥨', text: 'A crisp knot-shaped biscuit glazed and salted.' },
    { word: 'MEATBALL', visual: '🧆', text: 'A ball of ground meat, seasoned and cooked.' },
    { word: 'BACON', visual: '🥓', text: 'Cured meat from the sides of a pig.' },
    { word: 'BURGER', visual: '🍔', text: 'A round patty of ground beef in a split bun.' },
    { word: 'FRIES', visual: '🍟', text: 'Baton-shaped strips of deep-fried potatoes.' },
    { word: 'HOTDOG', visual: '🌭', text: 'A cooked sausage eaten in a long split roll.' },
    { word: 'ICE-CREAM', visual: '🍦', text: 'A soft frozen dessert made from milk fat.' },
    { word: 'CHOCOLATE', visual: '🍫', text: 'A sweet brown food preparation of cacao seeds.' },
    { word: 'LOLLIPOP', visual: '🍭', text: 'A large round boiled sweet on a stick.' },
    { word: 'JUICE', visual: '🧃', text: 'The liquid expressed from fruit or vegetables.' },
    { word: 'SCARF', visual: '🧣', text: 'A length of fabric worn around the neck.' },
    { word: 'SOCKS', visual: '🧦', text: 'Garments worn on the feet inside shoes.' },
    { word: 'COAT', visual: '🧥', text: 'An outer garment worn on the upper body.' },
    { word: 'PURSE', visual: '👛', text: 'A small pouch for carrying money or cards.' },
    { word: 'GLASSES', visual: '👓', text: 'Frames holding lenses to correct vision.' },
    { word: 'UMBRELLA', visual: '☂️', text: 'A folding canopy on a stick for rain protection.' },
    { word: 'KEYBOARD', visual: '⌨️', text: 'A panel of keys for inputting text to a computer.' },
    { word: 'PRINTER', visual: '🖨️', text: 'A machine for printing text or pictures on paper.' },
    { word: 'CALENDAR', visual: '📅', text: 'A chart showing the days, weeks, and months.' },
    { word: 'SCREW', visual: '🪛', text: 'A metal pin with a spiral thread for fastening.' },
    { word: 'SAW', visual: '🪚', text: 'A hand tool with a toothed blade for cutting wood.' },
    { word: 'PLIERS', visual: '🛠️', text: 'Pincers with parallel jaws for gripping objects.' },
    { word: 'BRICK', visual: '🧱', text: 'A rectangular block of clay used in building.' },
    { word: 'CANDLE', visual: '🕯️', text: 'A cylinder of wax with a central wick for light.' },
    { word: 'PAN', visual: '🍳', text: 'A shallow metal vessel used for frying food.' },
    { word: 'POT', visual: '🍲', text: 'A deep, round container used for cooking stews.' },
    { word: 'BUCKET', visual: '🪣', text: 'A cylindrical container with a handle for liquids.' },
    { word: 'BATH', visual: '🛁', text: 'A large tub that is filled with water for washing.' },
    { word: 'TOOTHBRUSH', visual: '🪥', text: 'A small brush used for cleaning the teeth.' },
    { word: 'SOFA', visual: '🛋️', text: 'A long upholstered seat with arms and a back.' },
    { word: 'TELEVISION', visual: '📺', text: 'A device with a screen for receiving broadcasts.' },
    { word: 'RADIO', visual: '📻', text: 'A device for receiving radio broadcasts.' },
    { word: 'NEEDLE', visual: '🪡', text: 'A very thin pointed steel tool used for sewing.' },
    { word: 'THREAD', visual: '🧵', text: 'A long thin strand of cotton or nylon fiber.' },
    { word: 'PIN', visual: '📌', text: 'A thin pointed piece of metal with a round head.' },
    { word: 'STETHOSCOPE', visual: '🩺', text: 'A medical instrument for listening to heartbeats.' },
    { word: 'BANDAGE', visual: '🩹', text: 'A strip of material used to bind up a wound.' },
    { word: 'SYRINGE', visual: '💉', text: 'A tube with a nozzle and piston for injecting liquid.' },
    { word: 'PILL', visual: '💊', text: 'A small round solid piece of medicine.' },
    { word: 'MICROSCOPE', visual: '🔬', text: 'An instrument for magnifying very small objects.' },
    { word: 'PLANET', visual: '🪐', text: 'A celestial body moving in an elliptical orbit.' },
    { word: 'COMET', visual: '☄️', text: 'A celestial object consisting of ice and dust.' },
    { word: 'VOLCANO', visual: '🌋', text: 'A mountain with a crater that erupts lava.' },
    { word: 'DESERT', visual: '🏜️', text: 'A barren area of land with little water.' },
    { word: 'ISLAND', visual: '🏝️', text: 'A piece of land surrounded by water.' },
    { word: 'MOUNTAIN', visual: '🏔️', text: 'A large natural elevation of the earth\'s surface.' },
    { word: 'FOREST', visual: '🌲', text: 'A large area covered chiefly with trees.' },
    { word: 'RIVER', visual: '🏞️', text: 'A large natural stream of water flowing in a channel.' },
    { word: 'BEACH', visual: '🏖️', text: 'A sandy shore by the ocean.' },
    { word: 'SUNFLOWER', visual: '🌻', text: 'A tall plant with a large yellow flower head.' },
    { word: 'CACTUS', visual: '🌵', text: 'A spiky succulent plant found in dry regions.' },
    { word: 'MAPLE', visual: '🍁', text: 'A tree with lobed leaves that turn red in autumn.' },
    { word: 'SNOWMAN', visual: '⛄', text: 'A representation of a human figure made of snow.' },
    { word: 'LIGHTNING', visual: '⚡', text: 'A powerful flash of electricity in the sky.' },
    { word: 'FIREFLY', visual: '🪰', text: 'A winged beetle that glows in the dark.' },
    { word: 'SPARK', visual: '✨', text: 'A small fiery particle thrown off from a fire.' },
    { word: 'SUBWAY', visual: '🚇', text: 'An underground railway system.' },
    { word: 'MOTORCYCLE', visual: '🏍️', text: 'A two-wheeled motor vehicle.' },
    { word: 'SCOOTER', visual: '🛴', text: 'A vehicle with a footboard and steering column.' },
    { word: 'TRACTOR', visual: '🚜', text: 'A powerful motor vehicle used on farms.' },
    { word: 'CRUISE', visual: '🚢', text: 'A large ship carrying passengers on holiday.' },
    { word: 'AMBULANCE', visual: '🚑', text: 'A vehicle equipped for taking sick people to hospital.' },
    { word: 'FIRETRUCK', visual: '🚒', text: 'A large vehicle equipped for fighting fires.' },
    { word: 'POLICE', visual: '🚓', text: 'A patrol car used by police officers.' },
    { word: 'TAXI', visual: '🚕', text: 'A motor vehicle licensed to transport passengers.' },
    { word: 'PARACHUTE', visual: '🪂', text: 'A cloth canopy used to slow down a fall.' },
    { word: 'SKIS', visual: '🎿', text: 'A pair of long narrow runners used for gliding on snow.' },
    { word: 'SLED', visual: '🛷', text: 'A vehicle runner for sliding over snow or ice.' },
    { word: 'BOWLING', visual: '🎳', text: 'A game in which a heavy ball is rolled down a lane.' },
    { word: 'SKATE', visual: '🛼', text: 'A boot with wheels or a blade on the sole.' },
    { word: 'DART', visual: '🎯', text: 'A small pointed missile thrown at a target.' },
    { word: 'YO-YO', visual: '🪀', text: 'A toy consisting of a spool wound with string.' },
    { word: 'DOMINO', visual: '🀄', text: 'A small rectangular block used in gaming.' },
    { word: 'DICE', visual: '🎲', text: 'A small cube with dots on each side, used in games.' },
    { word: 'CHESS', visual: '♟️', text: 'A board game for two players with pieces.' },
    { word: 'TRUMPET', visual: '🎺', text: 'A brass musical instrument with a flared bell.' },
    { word: 'ACCORDION', visual: '🪗', text: 'A portable box-shaped bellows instrument.' },
    { word: 'SAXOPHONE', visual: '🎷', text: 'A curved brass wind instrument with keys.' },
    { word: 'MICROPHONE', visual: '🎤', text: 'An instrument for converting sound waves into electrical energy.' },
    { word: 'HEADPHONES', visual: '🎧', text: 'A pair of small speakers worn on the ears.' },
    { word: 'COMPASS', visual: '🧭', text: 'An instrument showing the direction of magnetic north.' },
    { word: 'MAGNIFIER', visual: '🔍', text: 'A lens that makes an object appear larger.' },
    { word: 'BACKPACK', visual: '🎒', text: 'A bag carried on the back, used by students.' },
    { word: 'DUMBBELL', visual: '🏋️', text: 'A short bar with weights, used for exercise.' },
    { word: 'SKATEBOARD', visual: '🛹', text: 'A short board with wheels for riding on.' },
    { word: 'TRAMPOLINE', visual: '🤸', text: 'A strong fabric sheet on springs, used for jumping.' },
    { word: 'KANGAROO', visual: '🦘', text: 'An Australian plant-eating mammal with a pouch.' },
    { word: 'ZEBRA', visual: '🦓', text: 'An African wild horse with black-and-white stripes.' },
    { word: 'GIRAFFE', visual: '🦒', text: 'A tall African mammal with a very long neck.' },
    { word: 'ELEVATOR', visual: '🛗', text: 'A platform or compartment for raising people or goods.' },
    { word: 'STATION', visual: '🚉', text: 'A place where passenger trains regularly stop.' },
    { word: 'AIRPORT', visual: '🛬', text: 'A complex of runways and buildings for takeoffs.' },
    { word: 'CLOVER', visual: '🍀', text: 'A small plant with three or four leaves.' },
    { word: 'ACORN', visual: '🌰', text: 'The nut of the oak tree, in a woody cup.' }
  ];

  // Dynamically generated word pools per game session
  let wordPools = {};

  // Function to shuffle the master list and partition it into 50 levels of 3 words each
  function shuffleAndGeneratePools() {
    const shuffled = [...wordMaster];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    wordPools = {};
    for (let i = 1; i <= 50; i++) {
      const w1 = shuffled[(i - 1) * 3];
      const w2 = shuffled[(i - 1) * 3 + 1];
      const w3 = shuffled[(i - 1) * 3 + 2];
      wordPools[i] = [w1, w2, w3];
    }
  }

  // Game Engine setup
  const config = {
    gameId: 'word-finder',
    timeLimit: 0,
    maxLevels: 50,
    initLives: 3
  };

  // State variables
  let currentWordIndex = 0; // 0..2
  let currentWordData = null;
  let spellingBuffer = '';
  let activeLetterButtons = [];
  let spellingHistory = [];

  const engine = new GameEngine(config);

  // Hook Engine event callbacks
  engine.on('onStart', (state) => {
    overlayPause.classList.remove('overlay--active');
    overlayGameOver.classList.remove('overlay--active');
    
    // Regenerate randomized pools on game start or restart
    shuffleAndGeneratePools();
    
    initLevel(state.level);
  });

  engine.on('onPause', () => {
    overlayPause.classList.add('overlay--active');
  });

  engine.on('onResume', () => {
    overlayPause.classList.remove('overlay--active');
  });

  engine.on('onGameOver', (state, reason) => {
    overlayGameOver.classList.add('overlay--active');
    finalScoreEl.textContent = state.score;
    bestScoreEl.textContent = state.highScore;
    
    if (reason === 'win') {
      gameoverTitle.textContent = '🎉 Vocabulary Wiz!';
      gameoverTitle.style.color = 'var(--color-success)';
      gameoverDesc.textContent = `Excellent! You solved all words and completed your spelling cognitive training!`;
    } else if (reason === 'lives') {
      gameoverTitle.textContent = '💔 Out of Lives!';
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You spelled too many words incorrectly. Practice your spelling and try again!`;
    } else {
      gameoverTitle.textContent = "⏱ Time's Up!";
      gameoverTitle.style.color = 'var(--color-danger)';
      gameoverDesc.textContent = `You ran out of time. Work on your scanning speed and try again!`;
    }
  });

  // Level Setup
  function initLevel(levelNum) {
    currentWordIndex = 0;
    
    // Scale timer dynamically
    let levelTime = 0;
    if (levelNum >= 6) {
      levelTime = Math.max(25, Math.round(120 - (levelNum - 6) * 2.1));
    }
    
    engine.timeLimit = levelTime;
    engine.state.timeLeft = levelTime;
    engine.updateTimerUI();
    
    if (levelTime <= 0) {
      engine.stopTimer();
    } else {
      engine.startTimer();
    }
    
    loadWord(levelNum, currentWordIndex);
  }

  // Load a single word onto the board
  function loadWord(levelNum, wordIdx) {
    spellingBuffer = '';
    
    wordIndexEl.textContent = (wordIdx + 1).toString();
    levelValEl.textContent = levelNum.toString();
    
    currentWordData = wordPools[levelNum][wordIdx];
    
    // Set Clue UI
    clueVisual.textContent = currentWordData.visual;
    clueText.textContent = currentWordData.text;
    
    // Generate Blank Slots
    slotsContainer.innerHTML = '';
    for (let i = 0; i < currentWordData.word.length; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slotsContainer.appendChild(slot);
    }
    
    // Generate Keyboard letters
    generateKeyboard();
  }

  // Generate shuffled letters list with extra distractors
  function generateKeyboard() {
    lettersGrid.innerHTML = '';
    activeLetterButtons = [];
    
    const wordLetters = currentWordData.word.split('');
    
    // Scale distractor choices based on level
    let targetKeySize = 8;
    if (engine.state.level > 5) targetKeySize = 10;
    if (engine.state.level > 15) targetKeySize = 12;
    if (engine.state.level > 30) targetKeySize = 14;
    
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    while (wordLetters.length < targetKeySize) {
      const randLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!wordLetters.includes(randLetter)) {
        wordLetters.push(randLetter);
      }
    }
    
    // Shuffle the key choices
    for (let i = wordLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordLetters[i], wordLetters[j]] = [wordLetters[j], wordLetters[i]];
    }
    
    // Create buttons
    wordLetters.forEach((letter, index) => {
      const btn = document.createElement('div');
      btn.className = 'letter-btn';
      btn.textContent = letter;
      btn.dataset.index = index;
      
      btn.addEventListener('click', () => handleLetterPress(btn, letter));
      
      lettersGrid.appendChild(btn);
      activeLetterButtons.push(btn);
    });
  }

  // Tap keyboard letter
  function handleLetterPress(btn, letter) {
    if (!engine.state.isPlaying || engine.state.isPaused) return;
    if (btn.classList.contains('selected')) return;
    // Prevent typing during error display
    if (slotsContainer.querySelector('.slot.error')) return;

    btn.classList.add('selected');
    spellingBuffer += letter;
    spellingHistory.push(btn);
    
    // Fill the first empty slot
    const slots = slotsContainer.querySelectorAll('.slot');
    const fillIdx = spellingBuffer.length - 1;
    if (slots[fillIdx]) {
      slots[fillIdx].textContent = letter;
      slots[fillIdx].classList.add('filled');
    }

    // Check spelling once length matches
    if (spellingBuffer.length === currentWordData.word.length) {
      checkSpelling();
    }
  }

  // Tap Backspace
  function handleBackspace() {
    if (!engine.state.isPlaying || engine.state.isPaused) return;
    if (spellingHistory.length === 0) return;
    // Prevent deleting during error display
    if (slotsContainer.querySelector('.slot.error')) return;

    const lastBtn = spellingHistory.pop();
    if (lastBtn) {
      lastBtn.classList.remove('selected');
    }

    spellingBuffer = spellingBuffer.slice(0, -1);

    const slots = slotsContainer.querySelectorAll('.slot');
    const clearIdx = spellingBuffer.length;
    if (slots[clearIdx]) {
      slots[clearIdx].textContent = '';
      slots[clearIdx].classList.remove('filled');
      slots[clearIdx].classList.remove('error');
    }
  }

  // Verify spelling spelling
  function checkSpelling() {
    const isCorrect = spellingBuffer === currentWordData.word;
    const slots = slotsContainer.querySelectorAll('.slot');

    if (isCorrect) {
      // Spell Success
      slots.forEach(slot => {
        slot.classList.remove('filled');
        slot.classList.add('filled');
        slot.style.borderBottomColor = 'var(--color-success)';
      });
      
      engine.updateScore(150);
      
      setTimeout(() => {
        advanceWord();
      }, 800);
    } else {
      // Spell Error
      slots.forEach(slot => {
        slot.classList.add('error');
      });
      
      engine.decrementLives();
      
      // Reset buffers after short delay
      setTimeout(() => {
        resetSpelling();
      }, 800);
    }
  }

  // Clear spelling buffer for current word
  function resetSpelling() {
    spellingBuffer = '';
    spellingHistory = [];
    
    // Reset Slots UI
    const slots = slotsContainer.querySelectorAll('.slot');
    slots.forEach(slot => {
      slot.textContent = '';
      slot.className = 'slot';
      slot.style.borderBottomColor = 'var(--theme-accent)';
    });
    
    // Enable all keyboard buttons
    activeLetterButtons.forEach(btn => {
      btn.classList.remove('selected');
    });
  }

  // Go to next word or level
  function advanceWord() {
    currentWordIndex++;
    
    if (currentWordIndex < 3) {
      // Next word in current level
      loadWord(engine.state.level, currentWordIndex);
    } else {
      // Completed level!
      if (engine.state.level < config.maxLevels) {
        // Completion bonuses
        engine.updateScore(400);
        engine.setLevel(engine.state.level + 1);
        initLevel(engine.state.level);
      } else {
        // Game completed! Win!
        engine.updateScore(1000);
        engine.end('win');
      }
    }
  }

  // Buttons wiring
  btnPause.addEventListener('click', () => engine.pause());
  btnResume.addEventListener('click', () => engine.resume());
  btnRestart.addEventListener('click', () => engine.start());
  btnRetry.addEventListener('click', () => engine.start());
  btnClear.addEventListener('click', () => handleBackspace());

  // Start engine automatically on load
  engine.start();
});
