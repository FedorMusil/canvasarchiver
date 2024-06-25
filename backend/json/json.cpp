#include <iostream>
#include <string>

#include "nlohmann/json.hpp"

using json = nlohmann::json;

enum class Mode {
    DIFF,
    PATCH
};

Mode parseMode(std::string const& mode) {
    if (mode == "diff") {
        return Mode::DIFF;
    } else if (mode == "patch") {
        return Mode::PATCH;
    } else {
        throw std::runtime_error("Valid modes: diff, patch");
    }
}

json diff(json const& j1, json const& j2) {
    return json::diff(j1, j2);
}

json patch(json const& j, json const& patch) {
    return j.patch(patch);
}

int main() {
    std::string mode_str;
    std::getline(std::cin, mode_str);
    Mode mode = parseMode(mode_str);

    std::string line;
    std::getline(std::cin, line);
    json j1 = json::parse(line);

    std::getline(std::cin, line);
    json j2 = json::parse(line);

    switch (mode) {
        case Mode::DIFF: {
            json diff = json::diff(j1, j2);
            std::cout << diff.dump() << std::endl;
            break;
        }
        case Mode::PATCH: {
            json patched = patch(j1, j2);
            std::cout << patched.dump() << std::endl;
            break;
        }
    }
}
