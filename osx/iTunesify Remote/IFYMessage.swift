typealias IFYMessage = [String: Any]

func toJSON(message: IFYMessage) -> String? {
    if let data = try? JSONSerialization.data(withJSONObject: message, options: []) {
        return String(data: data, encoding: .utf8)
    }
    
    return nil
}

func fromJSON(json: String) -> IFYMessage? {
    guard let data = json.data(using: .utf8) else { return nil }
    
    return (try? JSONSerialization.jsonObject(with: data, options: [])) as? IFYMessage
}
