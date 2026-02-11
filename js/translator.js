/* ============================================================
   StopMyCancer.com — Pathology Report Translator
   Client-side pattern matching for pathology terms.
   Explains terms in plain language, generates doctor questions.
   NEVER diagnoses, predicts survival, or recommends treatment.
   ============================================================ */

(function () {
  'use strict';

  // --- Multilingual term database ---
  var TERMS = {
    en: {
      // Staging terms
      'T1': { category: 'stage', name: 'T1 (Tumor Size)', explanation: 'The tumor is relatively small, typically 2 cm or less. The "T" in staging refers to the primary tumor size. Your oncologist will explain what this means for your specific situation.' },
      'T2': { category: 'stage', name: 'T2 (Tumor Size)', explanation: 'The tumor is between 2 cm and 5 cm. This is part of the TNM staging system that describes tumor size. Discuss with your care team what this means in your case.' },
      'T3': { category: 'stage', name: 'T3 (Tumor Size)', explanation: 'The tumor is larger than 5 cm. The T category describes the primary tumor. Your doctor will explain the full picture including other factors.' },
      'T4': { category: 'stage', name: 'T4 (Tumor Size)', explanation: 'The tumor has grown into nearby structures (such as the chest wall or skin in breast cancer). Your oncologist will explain the specific details.' },
      'N0': { category: 'stage', name: 'N0 (Lymph Nodes)', explanation: 'No cancer was found in nearby lymph nodes that were examined. The "N" refers to whether cancer has spread to nearby lymph nodes.' },
      'N1': { category: 'stage', name: 'N1 (Lymph Nodes)', explanation: 'Cancer has been found in a small number of nearby lymph nodes. Your doctor will explain what this means for your treatment plan.' },
      'N2': { category: 'stage', name: 'N2 (Lymph Nodes)', explanation: 'Cancer has been found in several nearby lymph nodes. Your care team will discuss the implications for your specific situation.' },
      'N3': { category: 'stage', name: 'N3 (Lymph Nodes)', explanation: 'Cancer has been found in many nearby lymph nodes or in lymph nodes in certain locations. Talk with your oncologist about what this means.' },
      'M0': { category: 'stage', name: 'M0 (Metastasis)', explanation: 'No distant spread (metastasis) has been detected. The "M" indicates whether cancer has spread to distant parts of the body.' },
      'M1': { category: 'stage', name: 'M1 (Metastasis)', explanation: 'Cancer has spread to distant organs or tissues. Your oncologist will discuss what treatment options are available.' },
      'Stage I': { category: 'stage', name: 'Stage I', explanation: 'An early stage, typically meaning the cancer is small and only in the area where it started. Treatment options vary — ask your doctor about your specific situation.' },
      'Stage II': { category: 'stage', name: 'Stage II', explanation: 'Generally means the cancer is larger than Stage I but has not spread to distant parts of the body. Your care team will explain what this means for you.' },
      'Stage III': { category: 'stage', name: 'Stage III', explanation: 'Usually means the cancer is larger or has spread to nearby lymph nodes or tissues, but not to distant organs. Your oncologist will guide you through options.' },
      'Stage IV': { category: 'stage', name: 'Stage IV', explanation: 'Means the cancer has spread to distant organs. This does not mean there are no options — many treatments exist. Talk with your oncologist about your specific plan.' },

      // Grade terms
      'Grade 1': { category: 'grade', name: 'Grade 1 (Low Grade)', explanation: 'The cancer cells look similar to normal cells and tend to grow slowly. Grading describes how abnormal the cells look under a microscope.' },
      'Grade 2': { category: 'grade', name: 'Grade 2 (Intermediate Grade)', explanation: 'The cancer cells look somewhat different from normal cells. This is between low and high grade.' },
      'Grade 3': { category: 'grade', name: 'Grade 3 (High Grade)', explanation: 'The cancer cells look very different from normal cells and may grow more quickly. Your doctor will factor this into your treatment plan.' },
      'well differentiated': { category: 'grade', name: 'Well Differentiated', explanation: 'The cancer cells still look similar to normal cells. "Differentiation" describes how much the cancer cells resemble normal cells. Well-differentiated often corresponds to Grade 1.' },
      'moderately differentiated': { category: 'grade', name: 'Moderately Differentiated', explanation: 'The cancer cells look somewhat different from normal cells. This usually corresponds to Grade 2.' },
      'poorly differentiated': { category: 'grade', name: 'Poorly Differentiated', explanation: 'The cancer cells look very different from normal cells. This usually corresponds to Grade 3. Your oncologist will explain the significance.' },
      'undifferentiated': { category: 'grade', name: 'Undifferentiated', explanation: 'The cancer cells look nothing like normal cells. These cancers often receive higher-grade classifications. Ask your doctor what this means for your treatment.' },

      // Biomarkers
      'ER positive': { category: 'biomarker', name: 'ER Positive (Estrogen Receptor+)', explanation: 'The cancer cells have receptors for estrogen, meaning estrogen may help them grow. This information guides treatment decisions — hormone therapy may be an option. Ask your oncologist.' },
      'ER negative': { category: 'biomarker', name: 'ER Negative (Estrogen Receptor−)', explanation: 'The cancer cells do not have estrogen receptors. This means the cancer is not driven by estrogen. Your doctor will explain what treatment approaches are appropriate.' },
      'PR positive': { category: 'biomarker', name: 'PR Positive (Progesterone Receptor+)', explanation: 'The cancer cells have receptors for progesterone. Like ER status, this helps guide hormone therapy decisions. Discuss with your care team.' },
      'PR negative': { category: 'biomarker', name: 'PR Negative (Progesterone Receptor−)', explanation: 'The cancer cells do not have progesterone receptors. Your oncologist will use this along with other markers to plan treatment.' },
      'HER2 positive': { category: 'biomarker', name: 'HER2 Positive', explanation: 'The cancer cells make too much of a protein called HER2, which promotes cell growth. Targeted therapies exist for HER2-positive cancers. Ask your doctor about options.' },
      'HER2 negative': { category: 'biomarker', name: 'HER2 Negative', explanation: 'The cancer cells do not overproduce HER2 protein. This rules out certain targeted therapies but other treatments are available. Your oncologist will explain.' },
      'triple negative': { category: 'biomarker', name: 'Triple Negative', explanation: 'The cancer is ER negative, PR negative, and HER2 negative. This means it doesn\'t respond to hormone or HER2 therapies, but other treatments like chemotherapy and immunotherapy may be options. Talk with your oncologist.' },
      'Ki-67': { category: 'biomarker', name: 'Ki-67 (Proliferation Index)', explanation: 'A marker that shows how quickly cells are dividing. A higher Ki-67 percentage means faster-growing cells. Your oncologist will use this to help plan treatment.' },
      'BRCA1': { category: 'biomarker', name: 'BRCA1 Gene', explanation: 'A gene that normally helps repair DNA. Mutations in BRCA1 can increase cancer risk. If your report mentions BRCA1, ask your doctor about genetic counseling.' },
      'BRCA2': { category: 'biomarker', name: 'BRCA2 Gene', explanation: 'Like BRCA1, this gene helps repair DNA. Mutations in BRCA2 also increase cancer risk. Genetic counseling may be recommended.' },
      'PD-L1': { category: 'biomarker', name: 'PD-L1 (Programmed Death-Ligand 1)', explanation: 'A protein that can help cancer cells avoid the immune system. If PD-L1 is present, immunotherapy drugs may be an option. Discuss with your oncologist.' },
      'MSI': { category: 'biomarker', name: 'MSI (Microsatellite Instability)', explanation: 'Refers to changes in short repeated DNA sequences. High MSI (MSI-H) can affect treatment decisions, especially regarding immunotherapy. Ask your doctor.' },
      'MSI-H': { category: 'biomarker', name: 'MSI-High', explanation: 'High microsatellite instability. This can indicate that immunotherapy may be particularly effective. Your oncologist will explain what this means for your treatment.' },
      'TMB': { category: 'biomarker', name: 'TMB (Tumor Mutational Burden)', explanation: 'Measures how many mutations are in the tumor\'s DNA. A high TMB may mean immunotherapy could be more effective. Discuss with your care team.' },

      // Procedures & findings
      'sentinel lymph node': { category: 'procedure', name: 'Sentinel Lymph Node', explanation: 'The first lymph node(s) where cancer would likely spread. Testing these nodes helps determine if cancer has spread beyond the original site.' },
      'lumpectomy': { category: 'procedure', name: 'Lumpectomy', explanation: 'A surgery that removes the tumor and a small margin of surrounding tissue while preserving most of the breast. Also called breast-conserving surgery.' },
      'mastectomy': { category: 'procedure', name: 'Mastectomy', explanation: 'A surgery that removes the entire breast. There are different types — ask your surgeon about the specific type recommended for you.' },
      'excisional biopsy': { category: 'procedure', name: 'Excisional Biopsy', explanation: 'A procedure where the entire lump or suspicious area is surgically removed for examination under a microscope.' },
      'core biopsy': { category: 'procedure', name: 'Core Needle Biopsy', explanation: 'A procedure using a hollow needle to remove small cylinders of tissue for examination. This helps determine if a growth is cancerous.' },
      'margins': { category: 'procedure', name: 'Surgical Margins', explanation: 'The edge of the tissue removed during surgery. "Clear" or "negative" margins mean no cancer cells were found at the edges. "Positive" margins mean cancer cells extend to the edge.' },
      'clear margins': { category: 'procedure', name: 'Clear (Negative) Margins', explanation: 'No cancer cells were found at the edge of the removed tissue. This is generally a favorable finding. Your surgeon will explain what this means for next steps.' },
      'positive margins': { category: 'procedure', name: 'Positive Margins', explanation: 'Cancer cells were found at the edge of the removed tissue. This may mean additional surgery or treatment is needed. Your surgeon will discuss options.' },
      'negative margins': { category: 'procedure', name: 'Negative Margins', explanation: 'No cancer cells at the edge of removed tissue — same as "clear margins." This is generally a good sign. Confirm next steps with your surgeon.' },
      'invasive ductal carcinoma': { category: 'procedure', name: 'Invasive Ductal Carcinoma (IDC)', explanation: 'The most common type of breast cancer. It starts in the milk ducts and has grown into surrounding breast tissue. "Invasive" means it has grown beyond where it started.' },
      'invasive lobular carcinoma': { category: 'procedure', name: 'Invasive Lobular Carcinoma (ILC)', explanation: 'The second most common type of breast cancer. It starts in the milk-producing lobules and has grown into surrounding tissue.' },
      'ductal carcinoma in situ': { category: 'procedure', name: 'Ductal Carcinoma In Situ (DCIS)', explanation: 'Abnormal cells found inside the milk ducts that have not spread. "In situ" means "in place." DCIS is considered non-invasive or pre-invasive. Discuss treatment with your doctor.' },
      'DCIS': { category: 'procedure', name: 'DCIS (Ductal Carcinoma In Situ)', explanation: 'Non-invasive breast condition where abnormal cells are found in the lining of a breast duct. It has not spread outside the duct. Your doctor will discuss management options.' },
      'lymphovascular invasion': { category: 'procedure', name: 'Lymphovascular Invasion (LVI)', explanation: 'Cancer cells found in the lymph vessels or blood vessels near the tumor. Your oncologist factors this into treatment planning.' },
      'perineural invasion': { category: 'procedure', name: 'Perineural Invasion', explanation: 'Cancer cells found around or along nerves. This finding may influence treatment decisions. Ask your doctor about its significance in your case.' },
      'adenocarcinoma': { category: 'procedure', name: 'Adenocarcinoma', explanation: 'Cancer that starts in gland cells (cells that make mucus and other fluids). This type can occur in many organs including breast, lung, colon, and others.' },
      'carcinoma': { category: 'procedure', name: 'Carcinoma', explanation: 'Cancer that begins in cells that line the inside or outside surfaces of the body. This is the most common type of cancer.' },
      'necrosis': { category: 'procedure', name: 'Necrosis', explanation: 'Dead cells within the tumor. This can be a natural occurrence in tumors and is noted by pathologists. Ask your doctor about its significance in your report.' },
      'Oncotype DX': { category: 'biomarker', name: 'Oncotype DX', explanation: 'A genomic test that analyzes the activity of a group of genes to estimate the chance of recurrence and predict benefit from chemotherapy. Discuss results with your oncologist.' },
      'immunohistochemistry': { category: 'procedure', name: 'Immunohistochemistry (IHC)', explanation: 'A lab test that uses antibodies to check for certain proteins in tissue samples. Used to determine hormone receptor status and HER2 status, among other markers.' },
      'FISH': { category: 'procedure', name: 'FISH (Fluorescence In Situ Hybridization)', explanation: 'A lab test used to look at genes or chromosomes in cells. Often used to confirm HER2 status when IHC results are uncertain.' },
      'Nottingham grade': { category: 'grade', name: 'Nottingham Grade', explanation: 'A system used to grade breast cancer by examining tubule formation, nuclear features, and mitotic rate. It produces a score of 1 (low) to 3 (high). Ask your oncologist about your score.' },
      'Gleason score': { category: 'grade', name: 'Gleason Score', explanation: 'A grading system for prostate cancer based on how the cancer cells look under a microscope. Scores range from 6 to 10, with higher scores indicating more aggressive patterns. Discuss with your urologist.' },
    },

    es: {
      'T1': { category: 'stage', name: 'T1 (Tamaño del tumor)', explanation: 'El tumor es relativamente pequeño, generalmente de 2 cm o menos. La "T" se refiere al tamaño del tumor primario. Su oncólogo le explicará lo que esto significa para su situación específica.' },
      'T2': { category: 'stage', name: 'T2 (Tamaño del tumor)', explanation: 'El tumor mide entre 2 cm y 5 cm. Esto es parte del sistema de estadificación TNM. Consulte con su equipo médico.' },
      'T3': { category: 'stage', name: 'T3 (Tamaño del tumor)', explanation: 'El tumor mide más de 5 cm. La categoría T describe el tumor primario. Su médico le explicará el panorama completo.' },
      'T4': { category: 'stage', name: 'T4 (Tamaño del tumor)', explanation: 'El tumor ha crecido hacia estructuras cercanas. Su oncólogo le explicará los detalles específicos.' },
      'N0': { category: 'stage', name: 'N0 (Ganglios linfáticos)', explanation: 'No se encontró cáncer en los ganglios linfáticos cercanos examinados. La "N" se refiere a si el cáncer se ha propagado a los ganglios.' },
      'N1': { category: 'stage', name: 'N1 (Ganglios linfáticos)', explanation: 'Se encontró cáncer en un pequeño número de ganglios linfáticos cercanos. Su médico le explicará qué significa esto.' },
      'M0': { category: 'stage', name: 'M0 (Metástasis)', explanation: 'No se ha detectado propagación a distancia (metástasis). La "M" indica si el cáncer se ha propagado a partes distantes del cuerpo.' },
      'M1': { category: 'stage', name: 'M1 (Metástasis)', explanation: 'El cáncer se ha propagado a órganos o tejidos distantes. Su oncólogo discutirá las opciones de tratamiento disponibles.' },
      'Stage I': { category: 'stage', name: 'Estadio I', explanation: 'Un estadio temprano, que generalmente significa que el cáncer es pequeño y está solo en el área donde comenzó.' },
      'Stage II': { category: 'stage', name: 'Estadio II', explanation: 'Generalmente significa que el cáncer es más grande que el Estadio I pero no se ha propagado a partes distantes del cuerpo.' },
      'Stage III': { category: 'stage', name: 'Estadio III', explanation: 'Generalmente significa que el cáncer es más grande o se ha propagado a ganglios linfáticos cercanos, pero no a órganos distantes.' },
      'Stage IV': { category: 'stage', name: 'Estadio IV', explanation: 'Significa que el cáncer se ha propagado a órganos distantes. Esto no significa que no haya opciones — existen muchos tratamientos. Consulte con su oncólogo.' },
      'Grade 1': { category: 'grade', name: 'Grado 1 (Bajo grado)', explanation: 'Las células cancerosas se parecen a las células normales y tienden a crecer lentamente.' },
      'Grade 2': { category: 'grade', name: 'Grado 2 (Grado intermedio)', explanation: 'Las células cancerosas se ven algo diferentes de las células normales.' },
      'Grade 3': { category: 'grade', name: 'Grado 3 (Alto grado)', explanation: 'Las células cancerosas se ven muy diferentes de las células normales y pueden crecer más rápidamente.' },
      'ER positive': { category: 'biomarker', name: 'RE Positivo (Receptor de estrógeno+)', explanation: 'Las células cancerosas tienen receptores de estrógeno. La terapia hormonal puede ser una opción. Pregunte a su oncólogo.' },
      'ER negative': { category: 'biomarker', name: 'RE Negativo (Receptor de estrógeno−)', explanation: 'Las células cancerosas no tienen receptores de estrógeno. Su médico le explicará qué enfoques de tratamiento son apropiados.' },
      'PR positive': { category: 'biomarker', name: 'RP Positivo (Receptor de progesterona+)', explanation: 'Las células cancerosas tienen receptores de progesterona. Esto ayuda a guiar las decisiones de terapia hormonal.' },
      'PR negative': { category: 'biomarker', name: 'RP Negativo (Receptor de progesterona−)', explanation: 'Las células cancerosas no tienen receptores de progesterona.' },
      'HER2 positive': { category: 'biomarker', name: 'HER2 Positivo', explanation: 'Las células cancerosas producen demasiada proteína HER2. Existen terapias dirigidas para cánceres HER2 positivos. Pregunte a su médico.' },
      'HER2 negative': { category: 'biomarker', name: 'HER2 Negativo', explanation: 'Las células cancerosas no sobreproducen la proteína HER2. Otros tratamientos están disponibles.' },
      'triple negative': { category: 'biomarker', name: 'Triple Negativo', explanation: 'El cáncer es RE negativo, RP negativo y HER2 negativo. Otros tratamientos como quimioterapia e inmunoterapia pueden ser opciones. Consulte con su oncólogo.' },
      'Ki-67': { category: 'biomarker', name: 'Ki-67 (Índice de proliferación)', explanation: 'Un marcador que muestra qué tan rápido se dividen las células. Un porcentaje más alto de Ki-67 indica células de crecimiento más rápido.' },
      'invasive ductal carcinoma': { category: 'procedure', name: 'Carcinoma ductal invasivo (CDI)', explanation: 'El tipo más común de cáncer de mama. Comienza en los conductos de leche y ha crecido en el tejido mamario circundante.' },
      'DCIS': { category: 'procedure', name: 'CDIS (Carcinoma ductal in situ)', explanation: 'Condición mamaria no invasiva donde se encuentran células anormales en el revestimiento de un conducto mamario.' },
      'margins': { category: 'procedure', name: 'Márgenes quirúrgicos', explanation: 'El borde del tejido extraído durante la cirugía. Los márgenes "libres" o "negativos" significan que no se encontraron células cancerosas en los bordes.' },
      'sentinel lymph node': { category: 'procedure', name: 'Ganglio linfático centinela', explanation: 'El primer ganglio linfático donde es probable que se propague el cáncer. Examinar estos ganglios ayuda a determinar si el cáncer se ha extendido.' },
    },

    fr: {
      'T1': { category: 'stage', name: 'T1 (Taille de la tumeur)', explanation: 'La tumeur est relativement petite, généralement de 2 cm ou moins. Le "T" fait référence à la taille de la tumeur primaire. Votre oncologue vous expliquera ce que cela signifie.' },
      'T2': { category: 'stage', name: 'T2 (Taille de la tumeur)', explanation: 'La tumeur mesure entre 2 cm et 5 cm. Cela fait partie du système de stadification TNM. Discutez avec votre équipe soignante.' },
      'T3': { category: 'stage', name: 'T3 (Taille de la tumeur)', explanation: 'La tumeur mesure plus de 5 cm. La catégorie T décrit la tumeur primaire.' },
      'T4': { category: 'stage', name: 'T4 (Taille de la tumeur)', explanation: 'La tumeur a envahi les structures voisines. Votre oncologue vous expliquera les détails spécifiques.' },
      'N0': { category: 'stage', name: 'N0 (Ganglions lymphatiques)', explanation: 'Aucun cancer n\'a été trouvé dans les ganglions lymphatiques examinés. Le "N" indique si le cancer s\'est propagé aux ganglions.' },
      'N1': { category: 'stage', name: 'N1 (Ganglions lymphatiques)', explanation: 'Le cancer a été trouvé dans un petit nombre de ganglions lymphatiques voisins.' },
      'M0': { category: 'stage', name: 'M0 (Métastases)', explanation: 'Aucune propagation à distance (métastase) n\'a été détectée.' },
      'M1': { category: 'stage', name: 'M1 (Métastases)', explanation: 'Le cancer s\'est propagé à des organes ou tissus distants. Votre oncologue discutera des options de traitement.' },
      'Stage I': { category: 'stage', name: 'Stade I', explanation: 'Un stade précoce, signifiant généralement que le cancer est petit et localisé.' },
      'Stage II': { category: 'stage', name: 'Stade II', explanation: 'Le cancer est plus grand qu\'au Stade I mais ne s\'est pas propagé à des parties éloignées du corps.' },
      'Stage III': { category: 'stage', name: 'Stade III', explanation: 'Le cancer est plus grand ou s\'est propagé aux ganglions lymphatiques voisins, mais pas aux organes distants.' },
      'Stage IV': { category: 'stage', name: 'Stade IV', explanation: 'Le cancer s\'est propagé à des organes distants. De nombreux traitements existent — consultez votre oncologue.' },
      'Grade 1': { category: 'grade', name: 'Grade 1 (Bas grade)', explanation: 'Les cellules cancéreuses ressemblent aux cellules normales et ont tendance à croître lentement.' },
      'Grade 2': { category: 'grade', name: 'Grade 2 (Grade intermédiaire)', explanation: 'Les cellules cancéreuses sont quelque peu différentes des cellules normales.' },
      'Grade 3': { category: 'grade', name: 'Grade 3 (Haut grade)', explanation: 'Les cellules cancéreuses sont très différentes des cellules normales et peuvent croître plus rapidement.' },
      'ER positive': { category: 'biomarker', name: 'RE Positif (Récepteurs d\'œstrogènes+)', explanation: 'Les cellules cancéreuses ont des récepteurs d\'œstrogènes. L\'hormonothérapie peut être une option. Consultez votre oncologue.' },
      'ER negative': { category: 'biomarker', name: 'RE Négatif (Récepteurs d\'œstrogènes−)', explanation: 'Les cellules cancéreuses n\'ont pas de récepteurs d\'œstrogènes.' },
      'HER2 positive': { category: 'biomarker', name: 'HER2 Positif', explanation: 'Les cellules cancéreuses produisent trop de protéine HER2. Des thérapies ciblées existent. Demandez à votre médecin.' },
      'HER2 negative': { category: 'biomarker', name: 'HER2 Négatif', explanation: 'Les cellules cancéreuses ne surproduisent pas la protéine HER2.' },
      'triple negative': { category: 'biomarker', name: 'Triple Négatif', explanation: 'Le cancer est RE négatif, RP négatif et HER2 négatif. D\'autres traitements comme la chimiothérapie et l\'immunothérapie peuvent être des options.' },
      'Ki-67': { category: 'biomarker', name: 'Ki-67 (Indice de prolifération)', explanation: 'Un marqueur indiquant la vitesse de division des cellules. Un pourcentage Ki-67 plus élevé signifie des cellules à croissance plus rapide.' },
      'invasive ductal carcinoma': { category: 'procedure', name: 'Carcinome canalaire invasif (CCI)', explanation: 'Le type le plus courant de cancer du sein. Il commence dans les canaux galactophores et a envahi le tissu mammaire environnant.' },
      'DCIS': { category: 'procedure', name: 'CCIS (Carcinome canalaire in situ)', explanation: 'Condition mammaire non invasive où des cellules anormales sont trouvées dans la paroi d\'un canal mammaire.' },
      'margins': { category: 'procedure', name: 'Marges chirurgicales', explanation: 'Le bord du tissu retiré lors de la chirurgie. Des marges "saines" ou "négatives" signifient qu\'aucune cellule cancéreuse n\'a été trouvée aux bords.' },
      'sentinel lymph node': { category: 'procedure', name: 'Ganglion sentinelle', explanation: 'Le(s) premier(s) ganglion(s) lymphatique(s) où le cancer est susceptible de se propager.' },
    }
  };

  // --- Doctor questions by language ---
  var QUESTIONS = {
    en: {
      stage: [
        'What does my staging mean for treatment options?',
        'Is additional imaging needed to confirm the stage?',
        'How does the stage affect my prognosis?',
        'Should I get a second opinion on the staging?',
      ],
      grade: [
        'What does the grade tell you about how this cancer may behave?',
        'How does the grade influence treatment recommendations?',
        'Does the grade change over time or with treatment?',
      ],
      biomarker: [
        'How do these biomarker results affect my treatment options?',
        'Are there targeted therapies available for my biomarker profile?',
        'Should I get additional genomic testing?',
        'Does my biomarker status qualify me for any clinical trials?',
      ],
      procedure: [
        'What do these pathology findings mean for my next steps?',
        'Are additional procedures or tests needed based on these results?',
        'Should I see a specialist based on these findings?',
      ],
      general: [
        'Can you walk me through my full report in simple language?',
        'What are my treatment options given these results?',
        'Should I seek a second opinion?',
        'Are there clinical trials I should know about?',
        'What questions should I ask at my next appointment?',
        'Is genetic counseling recommended based on my results?',
      ]
    },
    es: {
      stage: [
        '¿Qué significa mi estadificación para las opciones de tratamiento?',
        '¿Se necesitan imágenes adicionales para confirmar el estadio?',
        '¿Cómo afecta el estadio a mi pronóstico?',
      ],
      grade: [
        '¿Qué le dice el grado sobre cómo puede comportarse este cáncer?',
        '¿Cómo influye el grado en las recomendaciones de tratamiento?',
      ],
      biomarker: [
        '¿Cómo afectan estos resultados de biomarcadores mis opciones de tratamiento?',
        '¿Hay terapias dirigidas disponibles para mi perfil de biomarcadores?',
        '¿Debería hacerme pruebas genómicas adicionales?',
      ],
      procedure: [
        '¿Qué significan estos hallazgos patológicos para mis próximos pasos?',
        '¿Se necesitan procedimientos o pruebas adicionales?',
      ],
      general: [
        '¿Puede explicarme mi informe completo en un lenguaje sencillo?',
        '¿Cuáles son mis opciones de tratamiento dados estos resultados?',
        '¿Debería buscar una segunda opinión?',
        '¿Hay ensayos clínicos que debería conocer?',
        '¿Se recomienda asesoramiento genético basado en mis resultados?',
      ]
    },
    fr: {
      stage: [
        'Que signifie ma stadification pour les options de traitement?',
        'Des examens d\'imagerie supplémentaires sont-ils nécessaires?',
        'Comment le stade affecte-t-il mon pronostic?',
      ],
      grade: [
        'Que nous dit le grade sur le comportement possible de ce cancer?',
        'Comment le grade influence-t-il les recommandations de traitement?',
      ],
      biomarker: [
        'Comment ces résultats de biomarqueurs affectent-ils mes options de traitement?',
        'Existe-t-il des thérapies ciblées pour mon profil de biomarqueurs?',
        'Devrais-je faire des tests génomiques supplémentaires?',
      ],
      procedure: [
        'Que signifient ces résultats pathologiques pour mes prochaines étapes?',
        'Des procédures ou tests supplémentaires sont-ils nécessaires?',
      ],
      general: [
        'Pouvez-vous m\'expliquer mon rapport complet en termes simples?',
        'Quelles sont mes options de traitement étant donné ces résultats?',
        'Devrais-je demander un deuxième avis?',
        'Y a-t-il des essais cliniques dont je devrais être au courant?',
        'Le conseil génétique est-il recommandé pour mes résultats?',
      ]
    }
  };

  var UI_TEXT = {
    en: {
      translateBtn: 'Translate My Report',
      clearBtn: 'Clear',
      sampleBtn: 'Try a Sample',
      outputEmpty: 'Your plain-language explanation will appear here',
      outputEmptyIcon: 'Paste or type your pathology report on the left, then click "Translate My Report"',
      termsFound: 'Terms Found in Your Report',
      questionsTitle: 'Questions to Ask Your Doctor',
      noTerms: 'We didn\'t find specific pathology terms in the text you entered. Try pasting a section from your pathology report, or try our sample report.',
      disclaimer: 'This tool provides general educational information only. It does not diagnose, predict outcomes, or recommend treatments. Always confirm findings with your care team.',
      urgentBanner: 'If you are experiencing severe symptoms such as sudden pain, difficulty breathing, high fever, or bleeding, seek emergency medical care immediately.',
      processing: 'Analyzing your report...',
    },
    es: {
      translateBtn: 'Traducir Mi Informe',
      clearBtn: 'Borrar',
      sampleBtn: 'Probar un Ejemplo',
      outputEmpty: 'Su explicación en lenguaje sencillo aparecerá aquí',
      outputEmptyIcon: 'Pegue o escriba su informe de patología a la izquierda, luego haga clic en "Traducir Mi Informe"',
      termsFound: 'Términos Encontrados en Su Informe',
      questionsTitle: 'Preguntas Para Hacerle a Su Médico',
      noTerms: 'No encontramos términos patológicos específicos en el texto que ingresó. Intente pegar una sección de su informe de patología, o pruebe nuestro informe de ejemplo.',
      disclaimer: 'Esta herramienta proporciona información educativa general solamente. No diagnostica, no predice resultados ni recomienda tratamientos. Siempre confirme los hallazgos con su equipo médico.',
      urgentBanner: 'Si experimenta síntomas graves como dolor repentino, dificultad para respirar, fiebre alta o sangrado, busque atención médica de emergencia inmediatamente.',
      processing: 'Analizando su informe...',
    },
    fr: {
      translateBtn: 'Traduire Mon Rapport',
      clearBtn: 'Effacer',
      sampleBtn: 'Essayer un Exemple',
      outputEmpty: 'Votre explication en langage simple apparaîtra ici',
      outputEmptyIcon: 'Collez ou tapez votre rapport de pathologie à gauche, puis cliquez sur "Traduire Mon Rapport"',
      termsFound: 'Termes Trouvés dans Votre Rapport',
      questionsTitle: 'Questions à Poser à Votre Médecin',
      noTerms: 'Nous n\'avons pas trouvé de termes pathologiques spécifiques dans le texte que vous avez saisi. Essayez de coller une section de votre rapport de pathologie, ou essayez notre rapport exemple.',
      disclaimer: 'Cet outil fournit des informations éducatives générales uniquement. Il ne diagnostique pas, ne prédit pas les résultats et ne recommande pas de traitements. Confirmez toujours les résultats avec votre équipe soignante.',
      urgentBanner: 'Si vous présentez des symptômes graves tels que douleur soudaine, difficulté à respirer, forte fièvre ou saignement, consultez immédiatement les urgences.',
      processing: 'Analyse de votre rapport...',
    }
  };

  var SAMPLE_REPORTS = {
    en: 'SURGICAL PATHOLOGY REPORT\n\nSpecimen: Left breast, lumpectomy\n\nDiagnosis: Invasive ductal carcinoma, Grade 2 (moderately differentiated), measuring 1.8 cm in greatest dimension.\n\nStaging: T1c N0 M0 — Stage I\n\nMargins: All margins negative (clear margins). Closest margin 3mm (anterior).\n\nBiomarkers:\n- ER positive (95% of cells staining)\n- PR positive (80% of cells staining)\n- HER2 negative (IHC score 1+)\n- Ki-67: 18%\n\nSentinel lymph node biopsy: 0/3 nodes positive for malignancy.\n\nNo lymphovascular invasion identified.\nNo perineural invasion identified.\n\nOncotype DX recurrence score pending.',

    es: 'INFORME DE PATOLOGÍA QUIRÚRGICA\n\nEspecimen: Mama izquierda, lumpectomía\n\nDiagnóstico: Invasive ductal carcinoma, Grade 2 (moderately differentiated), midiendo 1.8 cm en su dimensión mayor.\n\nEstadificación: T1c N0 M0 — Stage I\n\nMárgenes: Todos los márgenes negativos (clear margins). Margen más cercano 3mm (anterior).\n\nBiomarcadores:\n- ER positive (95% de células teñidas)\n- PR positive (80% de células teñidas)\n- HER2 negative (IHC puntuación 1+)\n- Ki-67: 18%\n\nBiopsia de sentinel lymph node: 0/3 ganglios positivos para malignidad.\n\nNo se identificó lymphovascular invasion.\nNo se identificó perineural invasion.',

    fr: 'RAPPORT DE PATHOLOGIE CHIRURGICALE\n\nSpécimen: Sein gauche, tumorectomie\n\nDiagnostic: Invasive ductal carcinoma, Grade 2 (moderately differentiated), mesurant 1.8 cm dans sa plus grande dimension.\n\nStadification: T1c N0 M0 — Stage I\n\nMarges: Toutes les marges négatives (clear margins). Marge la plus proche 3mm (antérieure).\n\nBiomarqueurs:\n- ER positive (95% des cellules marquées)\n- PR positive (80% des cellules marquées)\n- HER2 negative (IHC score 1+)\n- Ki-67: 18%\n\nBiopsie du sentinel lymph node: 0/3 ganglions positifs pour malignité.\n\nPas de lymphovascular invasion identifiée.\nPas de perineural invasion identifiée.'
  };

  // --- Detect current language ---
  function detectLang() {
    var html = document.documentElement;
    var lang = html.getAttribute('lang') || 'en';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('fr')) return 'fr';
    return 'en';
  }

  // --- Analyze report text ---
  function analyzeReport(text, lang) {
    var terms = TERMS[lang] || TERMS.en;
    var found = [];
    var categoriesFound = {};
    var textLower = text.toLowerCase();

    // Sort term keys by length (longest first) to match longer terms before shorter ones
    var termKeys = Object.keys(terms).sort(function (a, b) {
      return b.length - a.length;
    });

    var matchedPositions = [];

    termKeys.forEach(function (key) {
      var keyLower = key.toLowerCase();
      var idx = textLower.indexOf(keyLower);
      if (idx !== -1) {
        // Check we haven't already matched a longer term at this position
        var overlaps = matchedPositions.some(function (pos) {
          return idx >= pos.start && idx < pos.end;
        });

        if (!overlaps) {
          found.push(terms[key]);
          categoriesFound[terms[key].category] = true;
          matchedPositions.push({ start: idx, end: idx + keyLower.length });
        }
      }
    });

    return { terms: found, categories: categoriesFound };
  }

  // --- Generate questions list ---
  function getQuestions(categoriesFound, lang) {
    var questions = QUESTIONS[lang] || QUESTIONS.en;
    var result = [];

    Object.keys(categoriesFound).forEach(function (cat) {
      if (questions[cat]) {
        result = result.concat(questions[cat]);
      }
    });

    // Always add general questions
    result = result.concat(questions.general || []);

    // Deduplicate
    return result.filter(function (q, i, arr) {
      return arr.indexOf(q) === i;
    });
  }

  // --- Render results ---
  function renderResults(analysis, lang) {
    var ui = UI_TEXT[lang] || UI_TEXT.en;
    var outputEl = document.getElementById('translator-output');
    if (!outputEl) return;

    if (analysis.terms.length === 0) {
      outputEl.innerHTML = '<div class="translator__output-empty"><p>' + escapeHTML(ui.noTerms) + '</p></div>';
      return;
    }

    var html = '<h4 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-lg); color: var(--color-text);">' + escapeHTML(ui.termsFound) + ' (' + analysis.terms.length + ')</h4>';

    analysis.terms.forEach(function (term) {
      html += '<div class="result-term">';
      html += '<div class="result-term__header">';
      html += '<span class="result-term__badge result-term__badge--' + term.category + '">' + escapeHTML(term.category) + '</span>';
      html += '<span class="result-term__name">' + escapeHTML(term.name) + '</span>';
      html += '</div>';
      html += '<p class="result-term__explanation">' + escapeHTML(term.explanation) + '</p>';
      html += '</div>';
    });

    // Questions
    var questions = getQuestions(analysis.categories, lang);
    if (questions.length > 0) {
      html += '<div class="result-questions">';
      html += '<h4 class="result-questions__title">' + escapeHTML(ui.questionsTitle) + '</h4>';
      html += '<div class="result-questions__list">';
      questions.forEach(function (q) {
        html += '<div class="result-questions__item">';
        html += '<svg class="result-questions__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        html += '<span>' + escapeHTML(q) + '</span>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';
    }

    outputEl.innerHTML = html;
  }

  // --- HTML escape ---
  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // --- Initialize translator ---
  function initTranslator() {
    var translateBtn = document.getElementById('translator-btn');
    var clearBtn = document.getElementById('translator-clear');
    var sampleBtn = document.getElementById('translator-sample');
    var inputEl = document.getElementById('translator-input');
    var outputEl = document.getElementById('translator-output');

    if (!translateBtn || !inputEl) return;

    var lang = detectLang();

    translateBtn.addEventListener('click', function () {
      var text = inputEl.value.trim();
      if (!text) {
        inputEl.focus();
        return;
      }

      var analysis = analyzeReport(text, lang);
      renderResults(analysis, lang);

      // Scroll to output on mobile
      if (window.innerWidth < 768 && outputEl) {
        outputEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        inputEl.value = '';
        var ui = UI_TEXT[lang] || UI_TEXT.en;
        if (outputEl) {
          outputEl.innerHTML = '<div class="translator__output-empty"><div class="translator__output-empty-icon">&#128196;</div><p>' + escapeHTML(ui.outputEmpty) + '</p></div>';
        }
        inputEl.focus();
      });
    }

    if (sampleBtn) {
      sampleBtn.addEventListener('click', function () {
        var sample = SAMPLE_REPORTS[lang] || SAMPLE_REPORTS.en;
        inputEl.value = sample;
        var analysis = analyzeReport(sample, lang);
        renderResults(analysis, lang);
      });
    }

    // Allow Ctrl+Enter to translate
    inputEl.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        translateBtn.click();
      }
    });
  }

  // --- Mini translator on homepage ---
  function initMiniTranslator() {
    var miniBtn = document.getElementById('mini-translator-btn');
    var miniInput = document.getElementById('mini-translator-input');

    if (!miniBtn || !miniInput) return;

    miniBtn.addEventListener('click', function () {
      var text = miniInput.value.trim();
      if (text) {
        // Store text and redirect to full translator
        try {
          sessionStorage.setItem('smc_report_text', text);
        } catch (e) {
          // sessionStorage not available
        }
      }
      // Redirect to full translator page
      var lang = detectLang();
      var path = '/tools/pathology-translator';
      if (lang === 'es') path = '/es/tools/pathology-translator';
      if (lang === 'fr') path = '/fr/tools/pathology-translator';
      window.location.href = path;
    });

    miniInput.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        miniBtn.click();
      }
    });
  }

  // --- Load saved text on translator page ---
  function loadSavedText() {
    var inputEl = document.getElementById('translator-input');
    if (!inputEl) return;

    try {
      var saved = sessionStorage.getItem('smc_report_text');
      if (saved) {
        inputEl.value = saved;
        sessionStorage.removeItem('smc_report_text');
        // Auto-translate
        var lang = detectLang();
        var analysis = analyzeReport(saved, lang);
        renderResults(analysis, lang);
      }
    } catch (e) {
      // sessionStorage not available
    }
  }

  // --- Init ---
  function init() {
    initTranslator();
    initMiniTranslator();
    loadSavedText();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
