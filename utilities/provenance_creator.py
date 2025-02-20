import json
import random

def create_provenance_file():
    # Richiediamo un numero totale di nodi pari
    while True:
        try:
            total_nodes = int(input("Inserisci il numero totale di nodi (da 10 a 2000, numero pari): "))
            if 10 <= total_nodes <= 2000 and total_nodes % 2 == 0:
                break
            else:
                print("Inserisci un numero tra 10 e 2000 e assicurati che sia pari.")
        except ValueError:
            print("Inserisci un valore numerico valido.")

    # Richiediamo il grado (numero di collegamenti per nodo)
    while True:
        try:
            num_links = int(input("Inserisci il numero di collegamenti per nodo (0 a 3): "))
            if 0 <= num_links <= 3:
                break
            else:
                print("Inserisci un numero tra 0 e 3.")
        except ValueError:
            print("Inserisci un valore numerico valido.")

    # Partizioniamo i nodi in due insiemi uguali: entità e attività
    num_entities = total_nodes // 2
    num_activities = total_nodes // 2

    # Struttura di base del file di provenance
    provenance_data = {
        "entity": {},
        "activity": {},
        "wasDerivedFrom": {},   # Non verrà usata in questo modello
        "wasGeneratedBy": {},
        "used": {}
    }

    # Creazione delle entità
    entities = []
    for i in range(1, num_entities + 1):
        entity_name = f"nodo_fileProvenance{i}"
        provenance_data["entity"][entity_name] = {"prov:type": "prov:entity"}
        entities.append(entity_name)

    # Creazione delle attività
    activities = []
    for i in range(1, num_activities + 1):
        activity_name = f"activity_{i}"
        provenance_data["activity"][activity_name] = {"prov:type": "prov:activity"}
        activities.append(activity_name)

    # Se num_links == 0 non ci sono archi da generare.
    # Se num_links > 0, costruiamo un grafo bipartito d-regolare.
    d = num_links
    # Utilizzeremo la tecnica del "configuration model" per grafi bipartiti regolari:
    # - Creiamo una lista con d copie di ciascuna entità.
    # - La shuffliamo e la suddividiamo in gruppi da d, uno per ciascuna attività.
    if d > 0:
        entity_copies = []
        for e in entities:
            entity_copies.extend([e] * d)

        # Poiché il numero di entità e di attività è uguale, il numero totale di copie è:
        # num_entities * d == num_activities * d
        # Tentiamo finché non troviamo un'assegnazione in cui ogni attività riceve d entità distinti.
        valid_assignment = False
        while not valid_assignment:
            random.shuffle(entity_copies)
            valid_assignment = True
            assignment = {}
            # Per ciascuna attività, estraiamo un gruppo di d entità
            for i, activity in enumerate(activities):
                group = entity_copies[i*d:(i+1)*d]
                # Se ci sono ripetizioni, non è una assegnazione valida
                if len(set(group)) != d:
                    valid_assignment = False
                    break
                assignment[activity] = group

        # A questo punto, per ogni attività abbiamo assegnato d entità, e ogni entità apparirà esattamente d volte.
    else:
        # Se d == 0, nessun arco
        assignment = {activity: [] for activity in activities}

    # Aggiungiamo gli archi al file JSON.
    # Ogni arco collega un'attività a un'entità.
    # Per ogni arco scegliamo casualmente se rappresentarlo come:
    #   - wasGeneratedBy: {"prov:entity": <entità>, "prov:activity": <attività>}
    #   - used: {"prov:activity": <attività>, "prov:entity": <entità>}
    edge_id = 1
    for activity, entity_list in assignment.items():
        for entity in entity_list:
            relation_type = random.choice(["wasGeneratedBy", "used"])
            key = f"_:id{edge_id}"
            if relation_type == "wasGeneratedBy":
                provenance_data["wasGeneratedBy"][key] = {
                    "prov:entity": entity,
                    "prov:activity": activity
                }
            else:
                provenance_data["used"][key] = {
                    "prov:activity": activity,
                    "prov:entity": entity
                }
            edge_id += 1

    # Salvataggio del file JSON
    file_name = "provenance_file.json"
    with open(file_name, "w") as f:
        json.dump(provenance_data, f, indent=4)

    print(f"File di provenienza creato e salvato come '{file_name}'.")

if __name__ == "__main__":
    create_provenance_file()
