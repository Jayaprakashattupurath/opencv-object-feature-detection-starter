import argparse
import json
import cv2


def detect_people(image):
    hog = cv2.HOGDescriptor()
    hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

    # Best practice: resize for balanced speed/accuracy in near-real-time
    image_resized = cv2.resize(image, None, fx=0.7, fy=0.7)
    rects, weights = hog.detectMultiScale(
        image_resized,
        winStride=(8, 8),
        padding=(8, 8),
        scale=1.05
    )

    people = []
    for (x, y, w, h), score in zip(rects, weights):
        people.append({
            "x": int(x / 0.7),
            "y": int(y / 0.7),
            "w": int(w / 0.7),
            "h": int(h / 0.7),
            "confidence": float(score)
        })
    return people


def feature_match_score(scene_gray, template_gray):
    # Best practice: ORB is lightweight and good for real-time + CPU scenarios
    orb = cv2.ORB_create(nfeatures=800)
    kp1, des1 = orb.detectAndCompute(template_gray, None)
    kp2, des2 = orb.detectAndCompute(scene_gray, None)

    if des1 is None or des2 is None:
        return {"good_matches": 0, "is_match": False}

    matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    knn = matcher.knnMatch(des1, des2, k=2)

    good = []
    for m_n in knn:
        if len(m_n) == 2:
            m, n = m_n
            # Lowe's ratio test
            if m.distance < 0.75 * n.distance:
                good.append(m)

    # Heuristic threshold; tune on your own dataset
    is_match = len(good) >= 20
    return {"good_matches": len(good), "is_match": is_match}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="Path to current frame/image")
    parser.add_argument("--template", required=True, help="Path to reference template image")
    args = parser.parse_args()

    image = cv2.imread(args.image)
    template = cv2.imread(args.template, cv2.IMREAD_GRAYSCALE)

    if image is None or template is None:
        print(json.dumps({"error": "Could not read input image or template"}))
        return

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    people = detect_people(image)
    feature = feature_match_score(gray, template)

    result = {
        "people_count": len(people),
        "people_boxes": people,
        "feature_check": feature,
        "ok_for_gate_open": len(people) == 1 and feature["is_match"]
    }

    print(json.dumps(result))


if __name__ == "__main__":
    main()