# Stage 8 — Statistical Significance Analysis
## Σύγκριση 7-Band MicaSense Altum-PT vs RGB baseline στο M4 Stratified Sample

**Συγγραφέας:** Νικόλαος Κορωνιάδης  
**Επιβλέπων:** Δρ. Χρήστος Βασιλάκος  
**Πανεπιστήμιο Αιγαίου — MSc Geography & Geoinformatics, RSGIS Lab**  
**Μοντέλο:** DeepLabV3 + PointRend (ResNet-101 backbone)  
**Δείγμα:** n = 2.100 stratified random points (300 ανά κλάση)  
**Seed:** 1988  |  **Bootstrap iterations:** B = 10.000  |  **CRS:** WGS 84 / UTM 35N (EPSG:32635)  
**Ημερομηνία ανάλυσης:** 2026-04-09

---

## Σύνοψη ευρημάτων (Executive Summary)

Το 7-Band μοντέλο είναι **στατιστικά σημαντικά πιο ακριβές** από το RGB baseline στο σύνολο των 2.100 stratified points, με συγκλίνοντα αποτελέσματα και από τις τέσσερις στατιστικές αναλύσεις:

| Test | Result | Συμπέρασμα |
|---|---|---|
| McNemar exact (overall) | b=268, c=45, **p = 8.62 × 10⁻⁴⁰** | ✅ Reject H₀ |
| Z-test for two Kappas | z = 9.79, **p ≈ 0** | ✅ Reject H₀ |
| Paired bootstrap ΔOA | mean = +0.1061, **95% CI [+0.090, +0.122]** | ✅ Excludes 0 |
| Paired bootstrap ΔKappa | mean = +0.1079, **95% CI [+0.090, +0.126]** | ✅ Excludes 0 |
| Paired bootstrap ΔMacro-F1 | mean = +0.1029, **95% CI [+0.087, +0.119]** | ✅ Excludes 0 |
| Per-class McNemar (Holm) | **3 of 7 classes significant** | Building, Vehicle, Shadow-Noise |

**Κρίσιμη ανακάλυψη:** Το 7-Band δεν κερδίζει επειδή έχει "καλύτερη φασματική διαχωρισιμότητα" (όπως θα ανέμενε κανείς από τη remote sensing παράδοση). Κερδίζει επειδή έχει **γεωμετρική (nDSM) και θερμική (Thermal) πληροφορία** που λύνει συγκεκριμένα structural ambiguities σε 3 από τις 7 κλάσεις. Σε κλάσεις όπου το DeepLabV3+PointRend έχει ήδη ισχυρό spatial context (Tree, Grass, Bare Soil, Road), τα επιπλέον spectral bands προσφέρουν αμελητέα αξία μετά την Holm-Bonferroni correction.

---

## 1. Γιατί χρειαζόμαστε statistical significance test

Στο Stage 7 (M4 Stratified Sampling) καταλήξαμε σε αριθμητικές διαφορές υπέρ του 7-Band μοντέλου: **OA_7B = 0.9390** vs **OA_RGB = 0.8329** (διαφορά **+10.61 percentage points**). Η διαφορά φαίνεται μεγάλη — αλλά αυτή είναι παρατήρηση, όχι απόδειξη. Το κρίσιμο ερώτημα είναι:

> **Είναι αυτή η διαφορά πραγματικά οφειλόμενη στην προσθήκη των 4 επιπλέον bands (Red Edge, NIR, nDSM, Thermal), ή θα μπορούσε να έχει προκύψει από τυχαία δειγματοληψία 2.100 σημείων;**

Σε αυτό ακριβώς απαντούν τα significance tests. Στη remote sensing βιβλιογραφία η σύγκριση accuracy χωρίς p-value και confidence intervals θεωρείται σήμερα ελλιπής (Foody, 2004).

### Το πλεονέκτημα του δικού μας design

Το M4 έχει ένα σπάνιο χαρακτηριστικό: **τα ίδια ακριβώς 2.100 σημεία αξιολογούνται και από τα δύο μοντέλα**. Αυτό λέγεται **paired design** (συζευγμένος σχεδιασμός). Είναι το ισοδύναμο του να βάζεις δύο αξιολογητές να κρίνουν τις ίδιες φωτογραφίες, αντί να δίνεις σε καθέναν διαφορετικό σετ. Τα paired tests εκμεταλλεύονται αυτή τη συσχέτιση και δίνουν πολύ μεγαλύτερη **statistical power** από τα αντίστοιχα unpaired (Dietterich, 1998).

### Σημείωμα συνέπειας με Stage 7

Παρατηρήθηκε κατά την επαλήθευση ότι το αρχικό note του Stage 7 ανέφερε `OA_RGB = 0.8466`, ενώ ο πραγματικός υπολογισμός από τη στήλη `corr_RGB` του `sample_points_master.csv` (επαληθευμένη και από τη στήλη `pred_RGB`) δίνει `OA_RGB = 0.8329` (1.749 / 2.100). Η μικρή απόκλιση (~1.4%) πιθανώς οφείλεται σε προηγούμενο stale value. **Όλη η ανάλυση Stage 8 χρησιμοποιεί την επαληθευμένη τιμή 0.8329**, και ο αναγνώστης πρέπει να ενημερωθεί ότι το αντίστοιχο νούμερο στο Stage 7 χρειάζεται διόρθωση για συνέπεια.

---

## 2. Η στρατηγική σε 4 επίπεδα

| # | Test | Τι απαντάει | Αναφορά |
|---|---|---|---|
| 1 | **McNemar's exact binomial** | Διαφέρει το OA στατιστικά; | McNemar (1947); Dietterich (1998) |
| 2 | **Z-test για δύο Kappa** | Διαφέρει το Kappa; (παραδοσιακό RS) | Congalton & Green (2019), Ch. 9 |
| 3 | **Per-class McNemar + Holm** | Σε ποιες κλάσεις κερδίζει το 7-Band; | McNemar (1947); Holm (1979) |
| 4 | **Paired bootstrap (B=10.000)** | Πόσο μεγάλη είναι η διαφορά; | Efron (1979); Efron & Tibshirani (1993) |

Η φιλοσοφία είναι **convergent validity**: αντί για ένα μοναδικό test, εφαρμόζουμε τέσσερις συμπληρωματικές αναλύσεις. Αν όλες συμφωνούν, η ιστορία γίνεται πρακτικά αδιάσειστη.

---

## 3. McNemar's exact binomial test — η καρδιά της ανάλυσης

### 3.1 Εξήγηση για μη εξειδικευμένο κοινό

Φαντάσου ότι έχεις **2.100 ασθενείς** και δύο διαγνωστικά μηχανήματα, A και B. Κάθε ασθενής εξετάζεται και από τα δύο. Στο τέλος βάζεις τα αποτελέσματα σε έναν πίνακα 2×2:

```
                       B σωστό    B λάθος
        A σωστό          a           b
        A λάθος          c           d
```

- **a** = και τα δύο πέτυχαν (συμφωνούν, σωστά)
- **d** = και τα δύο απέτυχαν (συμφωνούν, λάθος)
- **b** = μόνο το A πέτυχε (διαφωνούν)
- **c** = μόνο το B πέτυχε (διαφωνούν)

Τα **a** και **d** δεν λένε τίποτα για το ποιο μηχάνημα είναι καλύτερο — απλώς συμφωνούν. **Όλη η πληροφορία της σύγκρισης βρίσκεται στα b και c** (τα *discordant pairs*). Αν τα δύο μηχανήματα είναι εξίσου καλά, τότε τα b και c θα είναι περίπου ίσα. Αν το ένα είναι σαφώς καλύτερο, η μία κατηγορία θα κυριαρχεί.

Το McNemar's test ρωτάει: **είναι το b αρκετά μεγαλύτερο από το c για να μην οφείλεται στην τύχη;** Μαθηματικά, υπό την null hypothesis ότι τα δύο μοντέλα είναι ισοδύναμα, το b ακολουθεί κατανομή `Binomial(b+c, 0.5)` — δηλαδή κάθε *discordant pair* είναι σαν κορώνα-γράμματα. Χρησιμοποιούμε την **exact** binomial εκδοχή (όχι το chi-square approximation) γιατί είναι πιο αυστηρή και δεν χρειάζεται continuity correction (Edwards, 1948).

> **Γιατί McNemar και όχι ένα κλασικό z-test δύο αναλογιών;**  
> Γιατί τα δύο μοντέλα δεν αξιολογούνται σε ξεχωριστά σύνολα — αξιολογούνται στα **ίδια** 2.100 σημεία. Αυτό δημιουργεί correlation που το unpaired test αγνοεί, με αποτέλεσμα να χάνει statistical power. Ο Dietterich (1998) έδειξε συστηματικά ότι το McNemar έχει την καλύτερη ισορροπία Type I error / power όταν συγκρίνουμε δύο classifiers στο ίδιο test set.

### 3.2 Αποτελέσματα — Overall McNemar

![McNemar Contingency Table](mcnemar_contingency.png)

**Πίνακας 1.** McNemar 2×2 contingency table πάνω στα 2.100 stratified sample points.

| | RGB correct | RGB wrong | Total |
|---|---|---|---|
| **7-Band correct** | a = **1.704** (81.1%) | b = **268** (12.8%) | 1.972 |
| **7-Band wrong** | c = **45** (2.1%) | d = **83** (4.0%) | 128 |
| **Total** | 1.749 | 351 | 2.100 |

**Στατιστικά:**
- Discordant pairs: n = b + c = **313**
- Test statistic: b = 268
- **p-value (two-sided exact binomial): 8.62 × 10⁻⁴⁰**
- **Odds ratio b/c: 5.96**
- Decision (α = 0.05): ✅ **REJECT H₀**

### 3.3 Οπτικοποίηση της null distribution

![McNemar Null Distribution Overall](mcnemar_null_overall.png)

**Σχήμα 1.** Η null distribution `Binomial(313, 0.5)` του McNemar test. Κάτω από H₀, αναμένουμε b ≈ 156.5 (γκρι διακεκομμένη γραμμή). Η παρατηρούμενη τιμή **b = 268 (πράσινη γραμμή)** βρίσκεται **12.6 standard deviations** δεξιά της αναμενόμενης — τόσο μακριά που η πιθανότητα μάζα στο σημείο αυτό είναι ουσιαστικά μηδέν. Η συμμετρική τιμή c = 45 (πορτοκαλί γραμμή) είναι αντίστοιχα μακριά αριστερά. Η rejection region (κόκκινες μπάρες, α = 0.05 two-sided) δεν διακρίνεται οπτικά γιατί καλύπτει εξαιρετικά μικρή ουρά της PMF γύρω από k ≈ 138 και k ≈ 175.

**Πρακτικό μήνυμα:** Όταν τα δύο μοντέλα διαφωνούν σε ένα σημείο, **το 7-Band έχει σχεδόν 6 φορές περισσότερες πιθανότητες να είναι το σωστό από ό,τι το RGB**. Αυτή είναι η πιο άμεσα κατανοητή ερμηνεία του odds ratio.

---

## 4. Z-test για δύο Kappa coefficients

### 4.1 Τι είναι το Kappa και γιατί χρειάζεται

Το **Cohen's Kappa** (Cohen, 1960) είναι μια μετρική agreement που "διορθώνει" το OA για τη συμφωνία που θα μπορούσε να συμβεί τυχαία. Σε ένα dataset με ισχυρά imbalanced classes (όπως το δικό μας, με Bare Soil ~55% των pixels στο raster), το OA μπορεί να είναι παραπλανητικά υψηλό αν το μοντέλο "παίζει ασφαλές" προβλέποντας πάντα την κυρίαρχη κλάση. Το Kappa τιμωρεί αυτή τη συμπεριφορά:

$$\kappa = \frac{p_o - p_e}{1 - p_e}$$

όπου `p_o` είναι το observed agreement (= OA) και `p_e` το expected agreement αν τα δύο μοντέλα έκαναν τυχαίες προβλέψεις με τις ίδιες περιθωριακές κατανομές.

### 4.2 Το test

Οι Congalton & Green (2019, Ch. 9) προτείνουν τον ακόλουθο τύπο για τη σύγκριση δύο Kappa:

$$Z = \frac{\hat{\kappa}_1 - \hat{\kappa}_2}{\sqrt{\hat{\sigma}^2_{\kappa_1} + \hat{\sigma}^2_{\kappa_2}}}$$

όπου οι variance estimators `σ²_κ` υπολογίζονται από τον τύπο μεγάλου δείγματος (Cohen, 1960; Fleiss, Cohen & Everitt, 1969).

### 4.3 Αποτελέσματα

| Quantity | 7-Band | RGB |
|---|---|---|
| Kappa | **0.9289** | **0.8209** |
| Var(Kappa) | 3.71 × 10⁻⁵ | 8.46 × 10⁻⁵ |

- **ΔKappa = +0.1080**
- **Z statistic = 9.79**
- **p-value (two-sided) ≈ 0** (κάτω από το floating-point precision του scipy)
- Decision (α = 0.05): ✅ **REJECT H₀**

> **⚠️ Προσοχή στην ερμηνεία.** Ο τύπος των Congalton & Green υποθέτει ότι τα δύο Kappa προέρχονται από **ανεξάρτητα** δείγματα — κάτι που στην περίπτωσή μας **δεν** ισχύει (paired design). Αυτό κάνει το συγκεκριμένο test **conservative**: τείνει να *υποτιμά* τη σημαντικότητα. Παρά τη συντηρητικότητά του, εδώ απορρίπτει το H₀ τόσο ισχυρά ώστε η ένδειξη να είναι αδιαμφισβήτητη. Το χρησιμοποιούμε ως *complementary check* δίπλα στο McNemar που είναι το primary test (Foody, 2004).

---

## 5. Per-class McNemar + Holm-Bonferroni correction

### 5.1 Το πρόβλημα του multiple testing

Όταν κάνουμε 7 ταυτόχρονα tests στο α = 0.05, η πιθανότητα τουλάχιστον ενός ψευδώς θετικού (Type I error) ανεβαίνει στο 1 − 0.95⁷ ≈ **30%**. Αυτό λέγεται **family-wise error rate (FWER)** inflation και πρέπει να διορθωθεί.

Ο Holm (1979) πρότεινε μια **sequentially rejective** εκδοχή του Bonferroni:
1. Ταξινομεί τα p-values από το μικρότερο στο μεγαλύτερο.
2. Πολλαπλασιάζει το μικρότερο επί m (=7), το επόμενο επί m−1 (=6), κ.ο.κ.
3. Ελέγχει το ίδιο FWER (5%) με αυστηρά **μεγαλύτερη statistical power** από το Bonferroni.

Είναι το προτιμώμενο default στη σύγχρονη στατιστική και είναι **uniformly more powerful** από το κλασικό Bonferroni.

### 5.2 Αποτελέσματα ανά κλάση

![Per-Class McNemar bars](per_class_mcnemar.png)

**Σχήμα 2.** Per-class McNemar discordant counts. Μπλε = "only 7-Band correct" (b), πορτοκαλί = "only RGB correct" (c). Πάνω από κάθε ζεύγος μπαρών εμφανίζεται η Holm-adjusted p-value και η σημαντικότητα.

**Πίνακας 2.** Πλήρη per-class McNemar results.

| Κλάση | n | a (both ✓) | **b (only 7B)** | **c (only RGB)** | d (both ✗) | Odds ratio | p_holm | Σημαντικότητα | Νικητής |
|---|---|---|---|---|---|---|---|---|---|
| Tree         | 300 | 272 | 5   | 17  | 6  | 0.29  | 0.0614 | ns  | n.s. |
| **Building** | 300 | 226 | **69**  | **0**   | 5  | ∞     | **2.0e-20** | **\*\*\*** | **7-Band** |
| Road         | 300 | 295 | 2   | 3   | 0  | 0.67  | 1.0    | ns  | n.s. |
| **Vehicle**  | 300 | 238 | **47**  | **3**   | 12 | **15.7** | **1.9e-10** | **\*\*\*** | **7-Band** |
| Grass        | 300 | 227 | 34  | 16  | 23 | 2.13  | 0.0614 | ns  | n.s. |
| Bare Soil    | 300 | 285 | 7   | 4   | 4  | 1.75  | 1.0    | ns  | n.s. |
| **Shadow-Noise** | 300 | 161 | **104** | **2**   | 33 | **52.0** | **9.8e-28** | **\*\*\*** | **7-Band** |

**Σύνοψη per-class:**
- **3 / 7 κλάσεις** δείχνουν στατιστικά σημαντική υπεροχή του 7-Band μετά Holm correction: **Building, Vehicle, Shadow-Noise**
- **4 / 7 κλάσεις** είναι **non-significant** μετά Holm: Tree, Road, Grass, Bare Soil
- Η κλάση **Tree** εμφανίζει **τάση προς το RGB** (b=5, c=17, OR=0.29) — η μόνη κλάση όπου το 7-Band δεν είναι ο leader (αν και η διαφορά δεν είναι σημαντική μετά Holm).
- Καμία κλάση δεν είναι σημαντική υπέρ του RGB μετά Holm correction.

### 5.3 Οπτικοποίηση των per-class null distributions

![Per-Class McNemar Null Distributions](mcnemar_null_per_class.png)

**Σχήμα 3.** Null distributions `Binomial(n_disc, 0.5)` για κάθε μία από τις 7 κλάσεις. Μπλε μπάρες = acceptance region, κόκκινες μπάρες = unadjusted α=0.05 rejection region, πράσινη γραμμή = παρατηρούμενη τιμή b. Ο τίτλος κάθε panel δείχνει την Holm-adjusted decision.

**Παιδαγωγική παρατήρηση — γιατί χρειαζόμαστε Holm:**  
Στις κλάσεις **Tree** και **Grass**, η πράσινη γραμμή φτάνει ή και ξεπερνά οριακά την unadjusted κόκκινη rejection region — δηλαδή αν είχαμε τρέξει μόνο ένα test για αυτές τις κλάσεις, θα τις δηλώναμε σημαντικές. Όμως επειδή κάναμε **7 ταυτόχρονα tests**, η Holm correction (ορθώς) πιο αυστηρά απαιτεί ισχυρότερη ένδειξη, και τις απορρίπτει ως n.s. Αυτό προστατεύει από false discoveries που θα οφείλονταν σε pure chance.

Αντιθέτως, σε **Building, Vehicle, Shadow-Noise**, η πράσινη γραμμή είναι τόσο μακριά από την κατανομή H₀ που η Holm correction δεν επηρεάζει καθόλου την απόφαση — η ένδειξη είναι αδιαμφισβήτητη.

### 5.4 Κρίσιμη ερμηνεία ανά κλάση

Ποια χαρακτηριστικά (από τα 4 επιπλέον bands του 7-Band) εξηγούν την επικράτηση σε κάθε κλάση;

| Κλάση | Decision | Πιθανή αιτία |
|---|---|---|
| **Building** (b=69, c=0) | 7-Band wins ✱✱✱ | **nDSM** — η πληροφορία ύψους είναι το killer feature· διαχωρίζει στέγες από λοιπά impervious surfaces |
| **Vehicle** (b=47, c=3) | 7-Band wins ✱✱✱ | **nDSM + Thermal** — τα οχήματα έχουν ξεχωριστή θερμοκρασία (κινητήρες) και ύψος πάνω από το έδαφος |
| **Shadow-Noise** (b=104, c=2) | 7-Band wins ✱✱✱ | **Thermal + Red Edge** — οι σκιές διατηρούν τη θερμοκρασία της επιφάνειας από κάτω, αποκαλύπτοντας τη γεωμετρία τους· το RGB μπλέκει shadow-on-tree με shadow-on-road |
| Tree | n.s. (τάση RGB) | Tο PointRend έχει ήδη ισχυρό spatial context· οι NIR/RedEdge μπάντες προσθέτουν θόρυβο που μπορεί οριακά να μπερδέψει τα boundary points |
| Grass | n.s. (marginal) | NDVI βοηθάει αλλά μικρή ωφέλεια — το RGB texture είναι ήδη επαρκές για το χλοοτάπητα |
| Road | n.s. | Οι δρόμοι έχουν χαρακτηριστικό spectral signature και geometry στο RGB· δεν χρειάζονται extra bands |
| Bare Soil | n.s. | Παρά τη χαμηλή precision του Bare Soil σε όλο το dataset, τα ίδια λάθη εμφανίζονται και στα δύο μοντέλα — δεν είναι spectral πρόβλημα |

---

## 6. Paired bootstrap (B = 10.000)

### 6.1 Από το p-value στο effect size

Ένα p-value απαντά στο **"υπάρχει διαφορά;"** αλλά όχι στο **"πόσο μεγάλη είναι;"**. Με n=2.100, ακόμα και αμελητέες διαφορές μπορεί να βγουν "στατιστικά σημαντικές". Για να ποσοτικοποιήσουμε το **μέγεθος** της διαφοράς, χρησιμοποιούμε **bootstrap confidence intervals**.

### 6.2 Πώς δουλεύει το bootstrap

Φαντάσου το dataset σαν μια κάλπη με 2.100 χαρτάκια. Κάθε χαρτάκι έχει: το ground-truth label, την πρόβλεψη του 7-Band, την πρόβλεψη του RGB. Το bootstrap κάνει το εξής:

1. Τραβάει **2.100 χαρτάκια με αντικατάσταση** (resampling) — αυτό είναι ένα *bootstrap replicate*.
2. Στο replicate αυτό υπολογίζει: OA_7B, OA_RGB, ΔOA, Kappa_7B, Kappa_RGB, ΔKappa, Macro-F1_7B, Macro-F1_RGB, ΔMacro-F1.
3. Επαναλαμβάνει **10.000 φορές**.
4. Από τις 10.000 τιμές της ΔOA, παίρνει τα percentiles 2.5% και 97.5% — αυτό είναι το **95% percentile confidence interval**.

> **🔑 Κρίσιμη λεπτομέρεια του paired design:** Δειγματίζουμε **σημεία**, όχι ξεχωριστά τις δύο στήλες προβλέψεων. Δηλαδή σε κάθε replicate, αν ένα σημείο επιλεγεί, μπαίνουν **και οι δύο** προβλέψεις του (7-Band και RGB) μαζί. Αυτό διατηρεί την paired δομή και είναι ο σωστός τρόπος (Efron & Tibshirani, 1993, Ch. 16).

### 6.3 Αποτελέσματα

![Bootstrap Distributions](bootstrap_distributions.png)

**Σχήμα 4.** Paired bootstrap distributions για τις τρεις διαφορές μετρικών (7-Band − RGB) από B=10.000 replicates. Όλες οι κατανομές είναι κεντραρισμένες γύρω από θετικές τιμές (~+0.10), και τα 95% CIs (μαύρες διακεκομμένες γραμμές) είναι **πολύ μακριά από το null Δ=0** (κόκκινη διακεκομμένη γραμμή). Καμία bootstrap replicate δεν έφτασε στο 0.

**Πίνακας 3.** Bootstrap point estimates και 95% percentile CIs.

| Metric | Mean | Std (SE) | 95% CI Low | 95% CI High | CI excludes 0? |
|---|---|---|---|---|---|
| OA_7B          | 0.9391 | 0.0052 | 0.9286 | 0.9490 | — |
| OA_RGB         | 0.8330 | 0.0081 | 0.8167 | 0.8486 | — |
| **ΔOA**        | **+0.1061** | 0.0082 | **+0.0900** | **+0.1224** | ✅ |
| Kappa_7B       | 0.9289 | 0.0061 | 0.9166 | 0.9405 | — |
| Kappa_RGB      | 0.8210 | 0.0091 | 0.8031 | 0.8386 | — |
| **ΔKappa**     | **+0.1079** | 0.0093 | **+0.0896** | **+0.1261** | ✅ |
| Macro-F1_7B    | 0.9399 | 0.0051 | 0.9297 | 0.9497 | — |
| Macro-F1_RGB   | 0.8370 | 0.0079 | 0.8214 | 0.8524 | — |
| **ΔMacro-F1**  | **+0.1029** | 0.0079 | **+0.0874** | **+0.1187** | ✅ |

**Ερμηνεία effect size:** Η διαφορά **+10.6 percentage points** στο OA δεν είναι απλώς "στατιστικά σημαντική" — είναι **practically substantial**. Σε μια εφαρμογή urban land cover mapping, αυτό μεταφράζεται σε ~10.6% μεγαλύτερη επιφάνεια χάρτη να είναι σωστή. Σε ένα 1 km² mapping job, αυτό είναι **τεράστια** πρακτική διαφορά.

Το bootstrap **σταθερά απορρίπτει την H₀** (καμία από τις 10.000 replicates δεν έδωσε ΔOA ≤ 0), ενισχύοντας το McNemar εύρημα.

---

## 7. Convergent validity check

| Test | p-value / CI | Decision |
|---|---|---|
| McNemar exact (overall) | p = 8.62 × 10⁻⁴⁰ | ✅ Reject H₀ |
| Z-test for two Kappas (Congalton & Green) | p ≈ 0 | ✅ Reject H₀ |
| Bootstrap ΔOA | 95% CI [+0.090, +0.122] | ✅ Excludes 0 |
| Bootstrap ΔKappa | 95% CI [+0.090, +0.126] | ✅ Excludes 0 |
| Bootstrap ΔMacro-F1 | 95% CI [+0.087, +0.119] | ✅ Excludes 0 |

**Και τα 5 ανεξάρτητα tests συμφωνούν:** Το 7-Band μοντέλο είναι στατιστικά σημαντικά πιο ακριβές από το RGB baseline. Αυτό είναι ισχυρή **convergent validity** — διαφορετικές μεθοδολογικές προσεγγίσεις (frequentist hypothesis test, asymptotic Z-test, resampling-based confidence intervals) καταλήγουν στο ίδιο συμπέρασμα.

---

## 8. Συζήτηση — τι σημαίνουν για τη θέση

### 8.1 Statistical vs practical significance

Τα δύο είναι διαφορετικά πράγματα. Με n=2.100, η ευαισθησία (statistical power) είναι αρκετή για να εντοπίσει ακόμα και μικρές διαφορές, οπότε ένα μικρό p-value από μόνο του δεν είναι εντυπωσιακό. Το πραγματικά εντυπωσιακό εδώ είναι ο **συνδυασμός**:

- **Στατιστική σημαντικότητα:** p = 8.62 × 10⁻⁴⁰ (όχι απλώς p < 0.05)
- **Effect size:** ΔOA = +10.61 pp με 95% CI [+9.0, +12.2] pp
- **Convergent validity:** 5 ανεξάρτητα tests ίδια κατεύθυνση

Αυτό δίνει στη θέση ένα συμπέρασμα που δεν μπορεί να αμφισβητηθεί στα σχόλια reviewers.

### 8.2 Η πραγματική ιστορία πίσω από το 7-Band advantage — αναθεωρημένη

Πριν τρέξουμε το per-class test, η αρχική υπόθεση ήταν ότι το 7-Band θα κέρδιζε κυρίως σε **vegetation classes** (Tree, Grass) όπου η NIR/RedEdge πληροφορία είναι κλασικά κρίσιμη για discrimination στη remote sensing βιβλιογραφία. **Τα αποτελέσματα διαψεύδουν αυτή την υπόθεση**.

| Αρχική υπόθεση | Πραγματικό αποτέλεσμα |
|---|---|
| Tree → 7-Band wins (NIR) | **n.s. — μάλιστα τάση προς RGB** |
| Grass → 7-Band wins (NDVI) | n.s. (marginal, p_holm = 0.061) |
| Building → 7-Band wins (nDSM) | ✅ Confirmed (b=69, c=0) |
| Bare Soil → 7-Band wins (Thermal) | n.s. |
| Vehicle → πιθανώς n.s. | ✅ Strong wins (b=47, c=3) |
| Shadow-Noise → πιθανώς n.s. | ✅ Massive wins (b=104, c=2) |

**Η αληθινή ιστορία:** Το 7-Band δεν κερδίζει επειδή έχει **καλύτερη φασματική διαχωρισιμότητα** σε vegetation classes. Κερδίζει επειδή έχει **γεωμετρική (nDSM) και θερμική (Thermal) πληροφορία** που λύνει συγκεκριμένα **structural ambiguities**:

1. **Building separation** — Η nDSM δίνει κάθετο διαχωρισμό από flat impervious surfaces. Αυτό είναι αδύνατο μόνο με spectral data, γι' αυτό RGB-only μοντέλα παραδοσιακά παλεύουν με στέγες.

2. **Vehicle detection** — Συνδυασμός nDSM (τα οχήματα είναι 1-2m πάνω από το έδαφος) και Thermal (κινητήρες ζεστοί). Δύο ξεχωριστά cues που το RGB δεν έχει.

3. **Shadow disambiguation** — Η Thermal information "βλέπει" την επιφάνεια κάτω από τη σκιά (η σκιά δεν αλλάζει την radiative temperature όσο αλλάζει το visible reflectance). Αυτό είναι το **πιο εντυπωσιακό εύρημα**: η Shadow-Noise κλάση είχε τη μεγαλύτερη βελτίωση από όλες (b=104 vs c=2, OR=52).

**Γιατί δεν κερδίζει σε vegetation;** Πιθανώς επειδή το **DeepLabV3+PointRend με ResNet-101 backbone έχει ήδη επαρκή spatial context** για να discriminate Tree από Grass μέσω texture και shape, χωρίς να χρειάζεται NIR/RedEdge spectral cues. Αυτό είναι σύμφωνο με την υπόθεση ότι deep learning models μπορούν να αντικαταστήσουν spectral information με spatial information όταν είναι αρκετά μεγάλα. Ένα παραδοσιακό pixel-based classifier (π.χ. Random Forest ή SVM) πιθανώς θα έδειχνε σαφή 7-Band advantage και στα Tree/Grass — αλλά εμείς τρέχουμε deep semantic segmentation.

> **Αυτή η ανακάλυψη είναι θέμα χωριστής συζήτησης στο thesis discussion chapter.** Είναι ένα εύρημα που "πλανά" την παραδοσιακή remote sensing προσδοκία και προσφέρει μια συγκεκριμένη θεωρητική συμβολή: **η αξία της φασματικής επέκτασης εξαρτάται από τη χωρητικότητα του classifier**. Σε ένα state-of-the-art deep semantic segmentation model, οι spectral bands προσφέρουν αξία *μόνο όπου το spatial context δεν αρκεί* — δηλαδή σε structural ambiguities (height, temperature) και όχι σε spectral discrimination tasks.

### 8.3 Συνέπειες για το dlpk deliverable

Με βάση τα ευρήματα, η σύσταση είναι **σαφής**:

- ✅ Το **7-Band model είναι το production-ready δίκτυο** που πρέπει να συσκευαστεί στο `.dlpk` για το Πανεπιστήμιο.
- Το RGB baseline αξίζει να διατηρηθεί ως **ablation study reference** στο thesis (δείχνει τι προσφέρει το spectral enrichment).
- Αν στο μέλλον υπάρχει ενδιαφέρον για **εμπορική απλούστευση** (πχ μόνο RGB UAVs), η ανάλυση δείχνει ότι το RGB είναι "good enough" σε 4/7 κλάσεις αλλά **αποτυγχάνει σοβαρά σε Building, Vehicle, Shadow-Noise**. Αυτή η πληροφορία πρέπει να μπει στο thesis ως practical recommendation.

### 8.4 Limitations

1. **Stratified sample dependency:** Το M4 χρησιμοποιεί 300 σημεία ανά κλάση, οπότε η ανάλυση είναι **balanced** — δεν αντικατοπτρίζει την πραγματική class distribution της σκηνής (όπου Bare Soil = 55%). Το overall p-value θα ήταν διαφορετικό σε ένα random sample, αλλά τα per-class αποτελέσματα είναι ανεξάρτητα από αυτό.

2. **Single test scene:** Όλη η ανάλυση βασίζεται σε ένα μόνο UAV survey scene. Generalization σε άλλες σκηνές (διαφορετικό canopy cover, διαφορετική εποχή, διαφορετικός φωτισμός) δεν είναι εγγυημένη και πρέπει να αναφέρεται στα limitations.

3. **Z-test conservatism:** Το Z-test των Congalton & Green υποθέτει ανεξάρτητα δείγματα — εδώ είναι **conservative**. Επειδή και πάλι απορρίπτει το H₀ τόσο ισχυρά, η ένδειξη είναι ασφαλής, αλλά για μελλοντικές δουλειές σε paired settings το McNemar πρέπει να είναι το primary test.

### 8.5 Σύνδεση με τα Stages 1–7

Τα Stage 8 ευρήματα **επιβεβαιώνουν και ποσοτικοποιούν** τα ποιοτικά μοτίβα από τα προηγούμενα stages:

- Στο **Stage 4** (M1 EMD validation) και **Stage 5** (M3 full raster) είδαμε ότι το Bare Soil δρα σαν "spectral magnet" και έχει χαμηλή precision και στα δύο μοντέλα — αυτό συνεπάγεται ότι τα ίδια λάθη υπάρχουν και εκεί που τα μοντέλα είναι "σωστά για λάθος λόγο", και το McNemar το επιβεβαιώνει (Bare Soil n.s.).
- Στο **Stage 7** (per-class F1) είδαμε ότι Building, Vehicle, Shadow-Noise είχαν τις μεγαλύτερες F1 βελτιώσεις — και ακριβώς αυτές οι κλάσεις είναι τώρα οι **στατιστικά σημαντικές** στο per-class McNemar.
- Το συνολικό OA gap (+10.6 pp) είναι σύμφωνο με το Stage 7 finding ότι το 7-Band κέρδιζε κατά ~10% σε όλες τις aggregate metrics.

---

## 9. Παραδοτέα Stage 8

Στον φάκελο `D:\thesis\Evaluation\evaluation_final\significance\`:

| Αρχείο | Περιεχόμενο |
|---|---|
| `significance_results.json` | Όλα τα αριθμητικά αποτελέσματα (machine-readable) |
| `significance_summary.csv` | Flat πίνακας: test, statistic, p, p_adj, CI, conclusion |
| `per_class_mcnemar.csv` | Per-class details (b, c, p, p_holm, winner) |
| `mcnemar_contingency.png` | 2×2 heatmap (§3.2) |
| `mcnemar_null_overall.png` | Null distribution overall (Σχήμα 1, §3.3) |
| `per_class_mcnemar.png` | Per-class b/c bar chart (Σχήμα 2, §5.2) |
| `mcnemar_null_per_class.png` | Per-class null distributions (Σχήμα 3, §5.3) |
| `bootstrap_distributions.png` | Bootstrap histograms 3 panels (Σχήμα 4, §6.3) |
| `significance_report.md` | Αυτή η αναφορά |

---

## 10. Bibliography

Cohen, J. (1960). A coefficient of agreement for nominal scales. *Educational and Psychological Measurement*, 20(1), 37–46. https://doi.org/10.1177/001316446002000104

Congalton, R. G., & Green, K. (2019). *Assessing the Accuracy of Remotely Sensed Data: Principles and Practices* (3rd ed.). CRC Press. https://doi.org/10.1201/9780429052729

Davison, A. C., & Hinkley, D. V. (1997). *Bootstrap Methods and their Application*. Cambridge University Press. (Cambridge Series in Statistical and Probabilistic Mathematics, No. 1). ISBN 978-0-521-57471-6.

Dietterich, T. G. (1998). Approximate statistical tests for comparing supervised classification learning algorithms. *Neural Computation*, 10(7), 1895–1923. https://doi.org/10.1162/089976698300017197

Edwards, A. L. (1948). Note on the "correction for continuity" in testing the significance of the difference between correlated proportions. *Psychometrika*, 13(3), 185–187.

Efron, B. (1979). Bootstrap methods: Another look at the jackknife. *The Annals of Statistics*, 7(1), 1–26. https://doi.org/10.1214/aos/1176344552

Efron, B., & Tibshirani, R. J. (1993). *An Introduction to the Bootstrap*. Chapman & Hall/CRC. (Monographs on Statistics and Applied Probability, No. 57). ISBN 978-0-412-04231-7.

Fleiss, J. L., Cohen, J., & Everitt, B. S. (1969). Large sample standard errors of kappa and weighted kappa. *Psychological Bulletin*, 72(5), 323–327. https://doi.org/10.1037/h0028106

Foody, G. M. (2004). Thematic map comparison: Evaluating the statistical significance of differences in classification accuracy. *Photogrammetric Engineering & Remote Sensing*, 70(5), 627–633. https://doi.org/10.14358/PERS.70.5.627

Holm, S. (1979). A simple sequentially rejective multiple test procedure. *Scandinavian Journal of Statistics*, 6(2), 65–70. https://www.jstor.org/stable/4615733

McNemar, Q. (1947). Note on the sampling error of the difference between correlated proportions or percentages. *Psychometrika*, 12(2), 153–157. https://doi.org/10.1007/BF02295996
