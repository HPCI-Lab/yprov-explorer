"""
This script, provenance-creator.py, is designed to interactively generate a JSON file representing
a mock provenance dataset. It prompts the user for input values (total nodes, link count per node) and
produces a JSON structure that includes entities, activities, and relationships between them.
It's particularly useful for creating test data or exploring basic provenance models.
"""

import json
import random

def create_provenance_file():
    while True:
        try:
            total_nodes = int(input("Inserisci il numero totale di nodi (da 10 a 2000, numero pari): "))
            if 10 <= total_nodes <= 2000 and total_nodes % 2 == 0:
                break
            else:
                print("Inserisci un numero tra 10 e 2000 e assicurati che sia pari.")
        except ValueError:
            print("Inserisci un valore numerico valido.")

    while True:
        try:
            num_links = int(input("Inserisci il numero di collegamenti per nodo (0 a 3): "))
            if 0 <= num_links <= 3:
                break
            else:
                print("Inserisci un numero tra 0 e 3.")
        except ValueError:
            print("Inserisci un valore numerico valido.")

    num_entities = total_nodes // 2
    num_activities = total_nodes // 2

    provenance_data = {
        "entity": {},
        "activity": {},
        "wasDerivedFrom": {},
        "wasGeneratedBy": {},
        "used": {}
    }

    entities = []
    for i in range(1, num_entities + 1):
        entity_name = f"nodo_fileProvenance{i}"
        provenance_data["entity"][entity_name] = {"prov:type": "prov:entity"}
        entities.append(entity_name)

    activities = []
    for i in range(1, num_activities + 1):
        activity_name = f"activity_{i}"
        provenance_data["activity"][activity_name] = {"prov:type": "prov:activity"}
        activities.append(activity_name)

    d = num_links
    if d > 0:
        entity_copies = []
        for e in entities:
            entity_copies.extend([e] * d)

        valid_assignment = False
        while not valid_assignment:
            random.shuffle(entity_copies)
            valid_assignment = True
            assignment = {}
            for i, activity in enumerate(activities):
                group = entity_copies[i*d:(i+1)*d]
                if len(set(group)) != d:
                    valid_assignment = False
                    break
                assignment[activity] = group

    else:
        assignment = {activity: [] for activity in activities}


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

    file_name = "provenance_file.json"
    with open(file_name, "w") as f:
        json.dump(provenance_data, f, indent=4)

    print(f"File di provenienza creato e salvato come '{file_name}'.")

if __name__ == "__main__":
    create_provenance_file()
